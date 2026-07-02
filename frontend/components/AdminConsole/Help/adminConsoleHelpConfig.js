let helpConfig = null
const labelTextCache = {}

export async function loadHelpConfig() {
  const url = `${window.location.origin}${window.assets}/json/config/AppSettingsHelp.json`
  try {
    const res = await fetch(url)
    const json = await res.json()
    helpConfig = json
  } catch (err) { throw err }
}

export function getHelpConfig() {
  return helpConfig
}

export async function fetchLabelText(labelCode, svSession) {
  if (labelTextCache[labelCode] !== undefined) return labelTextCache[labelCode]
  const url = `${window.server}/ReactElements/getTableWithFilter/${svSession}/SVAROG_LABELS/LABEL_CODE/${labelCode}/0`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const row = data?.[0]
    const text = row?.['SVAROG_LABELS.LABEL_DESCR'] || row?.['SVAROG_LABELS.LABEL_TEXT'] || ''
    labelTextCache[labelCode] = text
    return text
  } catch {
    return ''
  }
}
