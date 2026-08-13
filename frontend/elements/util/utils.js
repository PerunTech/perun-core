export function $(x) {
  return document.getElementById(x)
}

/* Resolves the backend/assets server origin. window.location.origin is wrong for this when running
locally (eg. webpack-dev-server on localhost:PORT) since the actual backend/assets host is configured
separately via window.server/window.json (see www/config.js) - use this instead of window.location.origin
whenever building a URL to fetch static JSON config or images from that server. */
export function getServerOrigin() {
  const fromWindow = window.bundleServer || window.json || window.server || window.location.origin
  return String(fromWindow).replace(/\/services\/?$/, '').replace(/\/$/, '')
}

export function replaceConfigParamsWithFieldVals(string, session) {
  string = string.replace('{token}', session)
  const array = string.split('/')
  for (let i = 0; i < array.length; i++) {
    if (array[i].charAt(0) === '{' && array[i].charAt(array[i].length - 1) === '}') {
      const fieldId = array[i].slice(1, -1)
      array[i] = document.getElementById(fieldId).value
    }
  }
  string = array.join('/')
  return string
}

/* Recursively find a key in the form data object which needs to be modified.
the function converts the string into an array format - splitting by "," */
export function convertStringToArrayInFormData(dataObject, property) {
  let result = null
  for (const key in dataObject) {
    if (key === property) {
      dataObject[key] = dataObject[key].split(',')
      return dataObject[key]
    }
    if (dataObject[key] instanceof Object) {
      result = convertStringToArrayInFormData(dataObject[key], property)
      if (result) {
        break
      }
    }
  }
  return result
}

/* Recursively check if there is a multiselection dropdown list enabled
in the UI schema field, and return the field name, if any is found */
export function findWidget(schemaObject, key, widget) {
  let result = null
  for (const property in schemaObject) {
    if (schemaObject[property][key] &&
      schemaObject[property][key] === widget) {
      return property
    }
    if (schemaObject[property] instanceof Object) {
      result = findWidget(schemaObject[property], key, widget)
      if (result) {
        break
      }
    }
  }
  return result
}

/* Returns the section name of the nested field */
export function findSectionName(schemaObject, field) {
  let result = null
  for (const property in schemaObject) {
    if (schemaObject[property][field]) {
      return property
    }
    if (schemaObject[property] instanceof Object) {
      result = findSectionName(schemaObject[property], field)
      if (result) {
        break
      }
    }
  }
  return result
}
