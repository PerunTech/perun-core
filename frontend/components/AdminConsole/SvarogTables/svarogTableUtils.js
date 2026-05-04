export const META_KEYS = ['OBJECT_ID', 'OBJECT_TYPE', 'PKID', 'PARENT_ID', 'recordType']

export const FIELD_UISCHEMA_OVERRIDE = {
  'ui:order': ['FIELD_NAME', 'LABEL_CODE', 'FIELD_TYPE', 'FIELD_SIZE', 'SORT_ORDER', 'CODE_LIST_MNEMONIC', 'IS_NULL', 'IS_UNIQUE', 'IS_PRIMARY_KEY', 'INDEX_NAME', '*'],
  // IS_NULL: { 'ui:widget': 'InvertedMandatoryCheckbox' },
}

export const isTrue = (v) => v === true || v === 'true' || v === 1

export const normalizeRow = (prefix, row) => {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.startsWith(prefix) ? k.slice(prefix.length) : k] = v
  }
  return out
}

export const normalizeField = (row) => normalizeRow('SVAROG_FIELDS.', row)

export const formDataToValues = (formData) =>
  Object.entries(formData)
    .filter(([key]) => !META_KEYS.includes(key))
    .map(([key, value]) => ({ [key]: value }))

export const formDataToDbDataObject = (formData, userId) => ({
  'com.prtech.svarog_common.DbDataObject': {
    pkid: formData.PKID || 0,
    object_id: formData.OBJECT_ID || 0,
    dt_insert: new Date().toISOString(),
    dt_delete: '9999-12-31T02:00:00.000Z',
    parent_id: formData.PARENT_ID || 0,
    object_type: formData.OBJECT_TYPE || 0,
    status: 'VALID',
    user_id: userId,
    values: formDataToValues(formData)
  }
})

export const applyFormDataOverrides = (items, overrides) => {
  for (const item of items) {
    const dbDataObject = item['com.prtech.svarog_common.DbDataObject']
    if (!dbDataObject) continue
    const override = overrides.find(o => o.OBJECT_ID === dbDataObject.object_id)
    if (override) {
      dbDataObject.values = formDataToValues(override)
    }
  }
}

export const downloadJson = (data, fileName) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.json`
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
