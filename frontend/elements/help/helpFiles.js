import axios from 'axios'

// Help content lives in SvFileStore rather than in labels: LABEL_DESCR is NVARCHAR(2000) of plain
// text, which is one or two paragraphs and no figures. File bytes go to a BLOB through SvLob, so a
// manual is bounded by the servlet container's multipart limit rather than by a column.
//
// FILE_TYPE is backed by the FILE_TYPES codelist, so these two values are added through
// Admin Console -> CodeList Editor with no code change and no migration.
export const HELP_DOC = 'HELP_DOC'
export const HELP_IMAGE = 'HELP_IMAGE'

// Documents hang off the owning module's plugin row; perun-core's own row holds the general ones.
export const PLUGIN_TABLE = 'SVAROG_PERUN_PLUGIN'

// The file endpoints resolve this through SvCore.getTypeIdByName, which expects the svarog table
// name and not the short context name. Sending 'PERUN_PLUGIN' makes getTypeIdByName fail, and the
// getObjectById that follows throws, which the endpoint reports as a 500. Derived from the table
// constant so the two cannot drift apart again.
export const HELP_ANCHOR_TYPE = PLUGIN_TABLE

// <locale>_<slug>.md, e.g. en_US_searching-holdings.md. Strict on purpose: a malformed name should
// surface as "not a help document" rather than silently defaulting to some locale.
const DOC_NAME = /^([a-z]{2}_[A-Z]{2})_(.+)\.md$/

// All HELP_IMAGE files share one flat namespace under the plugin row, so uploads are prefixed with
// the document stem they were added from to keep figure-1.png from colliding across documents.
const IMAGE_SEPARATOR = '__'

const MIME_BY_EXTENSION = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif',
  md: 'text/markdown', pdf: 'application/pdf'
}

/* ------------------------------------------------------------------ names -- */

export const parseDocName = (fileName) => {
  const match = DOC_NAME.exec(fileName ?? '')
  return match ? { locale: match[1], slug: match[2] } : null
}

export const buildDocName = (locale, slug) => `${locale}_${slug}.md`

/** The document stem an image upload is namespaced under, e.g. en_US_searching-holdings. */
export const docStem = (fileName) => (fileName ?? '').replace(/\.md$/, '')

export const buildImageName = (stem, originalName) => {
  const safe = (originalName ?? '').replace(/[\\/]/g, '_').trim()
  return `${stem}${IMAGE_SEPARATOR}${safe}`
}

/** The filename an author writes in the Markdown, recovered from the stored name. */
export const displayImageName = (storedName) => {
  const at = (storedName ?? '').indexOf(IMAGE_SEPARATOR)
  return at === -1 ? storedName : storedName.slice(at + IMAGE_SEPARATOR.length)
}

export const mimeFromName = (fileName) => {
  const extension = (fileName ?? '').split('.').pop()?.toLowerCase()
  return MIME_BY_EXTENSION[extension] ?? 'application/octet-stream'
}

/* ------------------------------------------------------------------ notes -- */

// FILE_NOTES travels to the server as a path segment on the upload URL, and the endpoint is
// @Encoded so whatever arrives is stored verbatim. Route values contain slashes, and a
// percent-encoded slash in a path is rejected outright by a default Tomcat configuration, so the
// index is base64url encoded: no slashes, no braces, nothing a container will argue with.
const toBase64Url = (text) => {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromBase64Url = (encoded) => {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - padded.length % 4) % 4))
  return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
}

export const encodeNotes = (notes) => toBase64Url(JSON.stringify(notes ?? {}))

/**
 * Reads the routing index back off a file row. Tolerates the three forms a note can arrive in:
 * base64url written by this module, bare JSON, or percent-encoded JSON written by hand.
 */
export const decodeNotes = (raw) => {
  const text = (raw ?? '').trim()
  if (!text) return {}

  const attempts = [
    () => JSON.parse(fromBase64Url(text)),
    () => JSON.parse(text),
    () => JSON.parse(decodeURIComponent(text))
  ]

  for (const attempt of attempts) {
    try {
      const parsed = attempt()
      if (parsed && typeof parsed === 'object') return parsed
    } catch { /* try the next encoding */ }
  }
  return {}
}

/* ------------------------------------------------------------------- rest -- */

// getUploadedFiles answers with Jsonable.toSimpleJson() over a DbDataArray. Observed shape is
// { indexField, filter, items: [ { object_id, FILE_NAME, ... } ] }: repo columns and field values
// sit flat on the item, there is no nested values object. An empty result skips toSimpleJson
// entirely and sends data: {}. The readers below still tolerate a bare array and a nested values
// object, so a serialization change degrades to an empty list instead of a crash.
/**
 * The response, or a throw when there is none.
 *
 * The global response interceptor in client.js handles 401, 302, 502 and 503 itself and then falls
 * out of its switch returning nothing, which resolves the promise with undefined instead of
 * rejecting it. Every reader below would otherwise parse an expired session as a successful empty
 * answer, and the index would cache "this module has no guides" for the life of the tab.
 *
 * A genuinely empty result is distinguishable: the backend skips toSimpleJson and sends data: {},
 * so only a missing response object is treated as a failure here.
 */
const requireResponse = (response) => {
  if (!response) throw new Error('The request did not complete')
  return response
}

const readItems = (payload) => {
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  return []
}

const readValue = (item, key) => item?.values?.[key] ?? item?.[key] ?? null

const readObjectId = (item) =>
  item?.object_id ?? item?.objectId ?? item?.OBJECT_ID ?? readValue(item, 'OBJECT_ID')

const toRecord = (item) => {
  const fileName = readValue(item, 'FILE_NAME')
  const parsed = parseDocName(fileName)
  return {
    objectId: readObjectId(item),
    fileName,
    fileType: readValue(item, 'FILE_TYPE'),
    fileSize: readValue(item, 'FILE_SIZE'),
    fileDate: readValue(item, 'FILE_DATE'),
    contentType: readValue(item, 'CONTENT_TYPE') || mimeFromName(fileName),
    notes: decodeNotes(readValue(item, 'FILE_NOTES')),
    locale: parsed?.locale ?? null,
    slug: parsed?.slug ?? null
  }
}

/** Lists one file type under an anchor object. One call returns the whole routing index. */
export const listHelpFiles = async (svSession, objectId, fileType, objectType = HELP_ANCHOR_TYPE) => {
  const url = `${window.server}/ReactElements/getUploadedFiles/sid/${svSession}`
    + `/object-id/${objectId}/object-type/${objectType}/file-type/${fileType}`
  const response = requireResponse(await axios.get(url))
  return readItems(response?.data).map(toRecord).filter(record => record.objectId && record.fileName)
}

/**
 * Fetches file bytes as a Blob. CONTENT_TYPE is null for every row written by the current upload
 * path, and downloadFile answers application/octet-stream regardless, so the type is taken from the
 * record and only then from the response.
 */
export const fetchHelpBlob = async (svSession, record) => {
  const url = `${window.server}/ReactElements/downloadFile/sid/${svSession}`
    + `/object-id/${record.objectId}/file-name/${encodeURIComponent(record.fileName)}`
  const response = requireResponse(await axios.get(url, { responseType: 'blob' }))
  return new Blob([response?.data], { type: record.contentType || mimeFromName(record.fileName) })
}

export const fetchHelpText = async (svSession, record) => {
  const blob = await fetchHelpBlob(svSession, record)
  return blob.text()
}

/**
 * Uploads one file. The single-file endpoint is the only one that accepts a note, so document saves
 * always go through here; the bulk endpoint hardcodes it to null.
 */
export const uploadHelpFile = async (svSession, { objectId, objectType = HELP_ANCHOR_TYPE, fileType, file, fileName, notes }) => {
  const payload = new FormData()
  payload.append('file', file, fileName ?? file.name)

  const url = `${window.server}/ReactElements/uploadFile/sid/${svSession}`
    + `/object-id/${objectId}/object-type/${objectType}/file-type/${fileType}`
    + `/note/${encodeNotes(notes)}`

  const response = requireResponse(await axios.post(url, payload, { headers: { 'Content-Type': 'multipart/form-data' } }))
  return response?.data
}

/** Saves Markdown text as a document, deriving the filename from its locale and slug. */
export const saveHelpDoc = (svSession, { objectId, locale, slug, markdown, notes }) => {
  const fileName = buildDocName(locale, slug)
  const file = new Blob([markdown], { type: 'text/markdown' })
  return uploadHelpFile(svSession, { objectId, fileType: HELP_DOC, file, fileName, notes })
}

/* --------------------------------------------------------------- deleting -- */

// svCONST.OBJECT_TYPE_FILE. The delete endpoint takes the type as a number, and the file rows
// getUploadedFiles returns carry the same value in object_type.
const OBJECT_TYPE_FILE = 2

/**
 * Invalidates one file object and the link that attached it.
 *
 * deleteObject reads its payload from the *key* of a form-urlencoded body, which is why the JSON
 * goes through encodeURIComponent and there is no value half. deleteLinks is on so the row in
 * SVAROG_LINK goes with the file rather than being left dangling at the plugin.
 */
export const deleteHelpFile = async (svSession, objectId) => {
  const payload = JSON.stringify({ OBJECT_ID: Number(objectId), OBJECT_TYPE: OBJECT_TYPE_FILE })
  const url = `${window.server}/ReactElements/deleteObject/${svSession}/false/true`
  const response = requireResponse(await axios.post(url, encodeURIComponent(payload), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }))
  if (String(response?.data?.type).toUpperCase() === 'ERROR') throw new Error(response.data.message)
  return response?.data
}

/**
 * Removes a document completely: every stored version of it, and the figures uploaded from it.
 *
 * Deleting only the newest row would appear to work and then silently resurrect the guide, because
 * newestByName would fall back to the previous version. Figures are matched on the document's own
 * `<locale>_<slug>__` prefix only, so a locale-neutral image shared with another translation is
 * left alone.
 */
export const deleteHelpDoc = async (svSession, { objectId, fileName }) => {
  const stem = docStem(fileName)

  const docs = await listHelpFiles(svSession, objectId, HELP_DOC)
  const versions = docs.filter(record => record.fileName === fileName)

  const images = await listHelpFiles(svSession, objectId, HELP_IMAGE)
  const figures = images.filter(record => record.fileName.startsWith(`${stem}${IMAGE_SEPARATOR}`))

  for (const record of [...versions, ...figures]) {
    await deleteHelpFile(svSession, record.objectId)
  }

  return { versions: versions.length, figures: figures.length }
}

/* ---------------------------------------------------------------- lookups -- */

/** Newest row per filename. Every save writes a new row, so history is free and the tail is stale. */
export const newestByName = (records) => {
  const newest = new Map()
  records.forEach(record => {
    const held = newest.get(record.fileName)
    const isNewer = !held
      || (record.fileDate ?? '') > (held.fileDate ?? '')
      || (record.fileDate === held.fileDate && Number(record.objectId) > Number(held.objectId))
    if (isNewer) newest.set(record.fileName, record)
  })
  return [...newest.values()]
}

/**
 * Finds the image a document meant by `name`. Tries the document's own namespaced upload first,
 * then the locale-stripped form, so a locale-neutral diagram is uploaded once and shared by every
 * translation while a localized screenshot stays specific to its language.
 */
export const resolveImageRecord = (images, stem, name) => {
  const slug = parseDocName(`${stem}.md`)?.slug
  const candidates = [
    `${stem}${IMAGE_SEPARATOR}${name}`,
    slug ? `${slug}${IMAGE_SEPARATOR}${name}` : null,
    name
  ].filter(Boolean)

  for (const candidate of candidates) {
    const found = images.find(image => image.fileName === candidate)
    if (found) return found
  }
  return null
}

/**
 * Object URLs held per file object id. createObjectURL keeps the bytes alive until revoked, so an
 * illustrated document opened repeatedly would pin every figure for the life of the tab.
 */
export const createBlobCache = () => {
  const urls = new Map()

  return {
    async get(svSession, record) {
      if (!record?.objectId) return null
      if (urls.has(record.objectId)) return urls.get(record.objectId)
      const blob = await fetchHelpBlob(svSession, record)
      const url = URL.createObjectURL(blob)
      urls.set(record.objectId, url)
      return url
    },
    peek(objectId) {
      return urls.get(objectId) ?? null
    },
    revokeAll() {
      urls.forEach(url => URL.revokeObjectURL(url))
      urls.clear()
    }
  }
}

/**
 * Resolves the PERUN_PLUGIN row a module's help files hang off.
 *
 * getConfigModules builds the bundle entries without the plugin's object id, so bundleStorage
 * cannot supply this. Looking the row up by CONTEXT_NAME keeps the feature working against an
 * unmodified backend; adding the id to the card JSON would remove this round trip.
 */
export const resolveHelpAnchor = async (svSession, contextName = 'perun-core') => {
  const url = `${window.server}/ReactElements/getTableWithFilter/${svSession}`
    + `/${PLUGIN_TABLE}/CONTEXT_NAME/${encodeURIComponent(contextName)}/1`
  const response = requireResponse(await axios.get(url))
  const rows = Array.isArray(response?.data) ? response.data : readItems(response?.data)
  const row = rows?.[0]
  if (!row) return null
  return row[`${PLUGIN_TABLE}.OBJECT_ID`] ?? row.object_id ?? readValue(row, 'OBJECT_ID') ?? null
}


const pluginCol = (row, name) => row[`${PLUGIN_TABLE}.${name}`] ?? readValue(row, name)

// Rows like grid-table and single-form-table are built-in placeholders rather than deployed
// modules, and carry "/" in every path column. A real JAVASCRIPT_PATH is what separates a module
// that can own help content from one that cannot.
const isModuleRow = (row) => {
  const jsPath = String(pluginCol(row, 'JAVASCRIPT_PATH') ?? '').trim()
  return Boolean(jsPath) && jsPath !== '/'
}

// getTableData translates LABEL_CODE when the plugin has a label, and leaves the raw code in place
// when it does not, so an untranslated code falls back to the context name.
const moduleTitle = (row, contextName) => {
  const label = pluginCol(row, 'LABEL_CODE')
  return label && !String(label).startsWith('perun.') ? label : contextName
}

/**
 * Every module that can own help content, as { id, title, objectId }, in one call.
 *
 * getTableData and getTableWithFilter both serialize through prapareTableQueryData, so this parses
 * the same TABLE.COLUMN shaped rows as resolveHelpAnchor without one lookup per module.
 */
export const listHelpModules = async (svSession) => {
  const url = `${window.server}/ReactElements/getTableData/${svSession}/${PLUGIN_TABLE}/0`
  const response = requireResponse(await axios.get(url))
  const rows = Array.isArray(response?.data) ? response.data : readItems(response?.data)

  return (rows ?? [])
    .filter(isModuleRow)
    .map(row => {
      const id = pluginCol(row, 'CONTEXT_NAME')
      return {
        id,
        title: moduleTitle(row, id),
        objectId: pluginCol(row, 'OBJECT_ID') ?? readObjectId(row),
        sortOrder: Number(pluginCol(row, 'SORT_ORDER')) || 0
      }
    })
    .filter(module => module.id && module.objectId)
    .sort((a, b) => a.sortOrder - b.sortOrder || String(a.title).localeCompare(String(b.title)))
}

/** Exported for tests and for callers holding an already-fetched plugin row set. */
export const toHelpModules = (rows) => (rows ?? [])
  .filter(isModuleRow)
  .map(row => {
    const id = pluginCol(row, 'CONTEXT_NAME')
    return { id, title: moduleTitle(row, id), objectId: pluginCol(row, 'OBJECT_ID'), sortOrder: Number(pluginCol(row, 'SORT_ORDER')) || 0 }
  })
  .filter(module => module.id && module.objectId)
  .sort((a, b) => a.sortOrder - b.sortOrder || String(a.title).localeCompare(String(b.title)))
