/**
 * A zip writer, enough to package one guide with its figures.
 *
 * Entries are stored rather than deflated. Compression would mean carrying an implementation this
 * project does not have, and would buy close to nothing: the figures are already PNG and JPEG, and
 * the Markdown beside them is a few kilobytes. Every extractor reads a stored entry.
 *
 * Nothing here handles zip64, which an archive of this size cannot need: the 32-bit size and offset
 * fields only run out past 4GB.
 */

// The standard CRC-32 (reflected polynomial 0xedb88320), built once. The format stores one per
// entry and extractors do check it, so this cannot be skipped.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value >>> 0
  }
  return table
})()

const crc32 = (bytes) => {
  let crc = 0xffffffff
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * The MS-DOS date and time the format stores. Seconds are halved because the field has one bit
 * fewer than it needs for them, which is the format's own rounding and not a loss worth avoiding.
 */
const dosStamp = (when) => ({
  time: (when.getHours() << 11) | (when.getMinutes() << 5) | (when.getSeconds() >> 1),
  date: ((when.getFullYear() - 1980) << 9) | ((when.getMonth() + 1) << 5) | when.getDate(),
})

const toBytes = async (data) => {
  if (data instanceof Uint8Array) return data
  if (typeof data === 'string') return new TextEncoder().encode(data)
  return new Uint8Array(await data.arrayBuffer())
}

// Names are written as UTF-8 and flagged as such (general purpose bit 11), which is the only way
// the format has to say so. Without the flag a name outside ASCII is read as code page 437.
const UTF8_NAMES = 0x0800
const LOCAL_HEADER = 30
const CENTRAL_HEADER = 46
const END_RECORD = 22

/**
 * Packs entries into one archive.
 *
 * @param {Array<{name: string, data: Blob|Uint8Array|string}>} entries in the order they are stored
 * @param {Date} when the modification time written to every entry
 * @returns {Promise<Blob>} the archive, ready to hand to a download
 */
export const zipBlob = async (entries, when = new Date()) => {
  const stamp = dosStamp(when)
  const encoder = new TextEncoder()
  const parts = []
  const directory = []
  let offset = 0

  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const data = await toBytes(entry.data)
    const crc = crc32(data)

    const header = new DataView(new ArrayBuffer(LOCAL_HEADER))
    header.setUint32(0, 0x04034b50, true)
    header.setUint16(4, 20, true)
    header.setUint16(6, UTF8_NAMES, true)
    header.setUint16(8, 0, true)
    header.setUint16(10, stamp.time, true)
    header.setUint16(12, stamp.date, true)
    header.setUint32(14, crc, true)
    header.setUint32(18, data.length, true)
    header.setUint32(22, data.length, true)
    header.setUint16(26, name.length, true)
    header.setUint16(28, 0, true)

    parts.push(header.buffer, name, data)
    directory.push({ name, data, crc, offset })
    offset += LOCAL_HEADER + name.length + data.length
  }

  const central = []
  let centralSize = 0

  for (const entry of directory) {
    const header = new DataView(new ArrayBuffer(CENTRAL_HEADER))
    header.setUint32(0, 0x02014b50, true)
    header.setUint16(4, 20, true)
    header.setUint16(6, 20, true)
    header.setUint16(8, UTF8_NAMES, true)
    header.setUint16(10, 0, true)
    header.setUint16(12, stamp.time, true)
    header.setUint16(14, stamp.date, true)
    header.setUint32(16, entry.crc, true)
    header.setUint32(20, entry.data.length, true)
    header.setUint32(24, entry.data.length, true)
    header.setUint16(28, entry.name.length, true)
    header.setUint16(30, 0, true)
    header.setUint16(32, 0, true)
    header.setUint16(34, 0, true)
    header.setUint16(36, 0, true)
    header.setUint32(38, 0, true)
    header.setUint32(42, entry.offset, true)

    central.push(header.buffer, entry.name)
    centralSize += CENTRAL_HEADER + entry.name.length
  }

  const end = new DataView(new ArrayBuffer(END_RECORD))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(4, 0, true)
  end.setUint16(6, 0, true)
  end.setUint16(8, directory.length, true)
  end.setUint16(10, directory.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  end.setUint16(20, 0, true)

  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' })
}
