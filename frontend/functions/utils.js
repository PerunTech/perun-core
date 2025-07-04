import { useEffect, useRef } from 'react'
import { ComponentManager } from '../elements'
import { store, updateSelectedRows, lastSelectedItem } from '../model'
import { strcmp } from '../model/utils'
import axios from 'axios'

export const replaceParamsWithBoundPropVals = (string, props) => {
  let array = string.split('/')
  for (let i = 0; i < array.length; i++) {
    if (array[i].charAt(0) === '{' && array[i].charAt(array[i].length - 1) === '}') {
      let propName = array[i].slice(1, -1)
      if (props[propName]) {
        array[i] = props[propName]
      } else if (array[i] !== '{SVAROG_FORM.OBJECT_ID}') {
        array[i] = '0'
      }
    }
  }
  string = array.join('/')
  return string
}

export function isJSON(value) {
  value = !strcmp(typeof value, 'string') ? JSON.stringify(value) : value
  try {
    value = JSON.parse(value);
  } catch (e) {
    return false
  }

  if (strcmp(typeof value, 'object') && value !== null) {
    return true
  }

  return false
}

export function isValidArray(array, minNumberOfElements) {
  /** returns true if the variable passsed as the first parameter is an array and
  there are at least X number of elements in the array, where X is the second function parameter */
  return (array && array.constructor === Array && array.length >= minNumberOfElements)
}

export function isValidObject(object, minNumberOfKeys) {
  /** returns true if the variable passsed as the first parameter is an object and
    there are at least X number of keys in the object, where X is the second function parameter */
  return (object && object.constructor === Object && Object.keys(object).length >= minNumberOfKeys)
}

export function copyFormData(oldFormData, formUiSchema, formConfig, suffix) {
  /** Copies the already existing data from all the form fields into another set of empty fields
   * ending with the suffix parameter
  */
  let formData = JSON.parse(JSON.stringify(oldFormData))
  if (isValidObject(formData, 1)) {
    for (let fieldId in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, fieldId)) {
        if (!isValidObject(formUiSchema, 1)) {
          formData[`${fieldId}${suffix}`] = formData[fieldId]
          let newFieldId = document.getElementById(`root_${fieldId}${suffix}`)
          if (newFieldId) {
            newFieldId.value = formData[fieldId]
          }
        } else {
          for (let fieldSchemaId in formUiSchema) {
            if (Object.prototype.hasOwnProperty.call(formUiSchema, fieldSchemaId) && fieldSchemaId === `${fieldId}${suffix}`) {
              if (!formUiSchema[fieldSchemaId]['ui:readonly']) {
                if (formConfig.properties[fieldSchemaId].format) {
                  if (formConfig.properties[fieldSchemaId].format === 'date') {
                    const arr = ['year', 'month', 'day']
                    let dateString = ''
                    for (let i = 0; i < arr.length; i++) {
                      const element = document.getElementById(`root_${fieldId}_${arr[i]}`)
                      const index = element.selectedIndex
                      const data = element[index].text
                      dateString = dateString + data + '-'
                      document.getElementById(`root_${fieldSchemaId}_${arr[i]}`).selectedIndex = index
                    }
                    formData[fieldSchemaId] = dateString.slice(0, -1)
                  }
                } else {
                  formData[fieldSchemaId] = formData[fieldId]
                  let newFieldId = document.getElementById(`root_${fieldSchemaId}`)
                  if (newFieldId) {
                    newFieldId.value = formData[fieldId]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return formData
}

/**
 * Handles the selection of multiple grid rows by dispatching a redux action
 * @param  {array} selectedRows The selected rows in the grid instance
 * @param  {string} gridId The ID of the grid instance
 */
export function handleRowSelection(selectedRows, gridId) {
  store.dispatch(updateSelectedRows(selectedRows, gridId))
}

/**
 * Sets the saveExecuted flag to false for the requested form instance
 * @param  {string} formId The ID of the form instance
 */
export function resetFormSaveState(formId) {
  ComponentManager.setStateForComponent(formId, null, { saveExecuted: false })
}

/**
 * Dispatches a redux action which adds the clicked (selected) row to the application state
 * @param  {string} gridId The ID of the grid instance
 * @param  {object} row The clicked row from the grid instance
 */
export function selectObject(gridId, row) {
  store.dispatch(lastSelectedItem(gridId, row))
}

/**
 * Get the current state of the caps lock key (active/inactive)
 * @param  {KeyboardEvent} event the keyboard event to be checked 
 * @param  {Function} callback callback function that will return the state of the caps lock key
 */
export function getCapsLockState(event, callback) {
  if (event.getModifierState('CapsLock')) {
    callback(true);
  } else {
    callback(false);
  }
}

export const downloadFile = (file, svSession, callback) => {
  if (file['objectId'] && file['fileName']) {
    const url = `${window.server}/ReactElements/downloadFile/sid/${svSession}/object-id/${file['objectId']}/file-name/${file['fileName']}`;
    axios
      .get(url, { responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res?.data], { type: res?.data?.type });
        const objectUrl = URL.createObjectURL(blob);
        callback(objectUrl)
      })
      .catch(err => {
        console.error('Download error:', err);
      });
  }
};

/**
 * Recursively searches an object for a value corresponding to a specified key.
 *
 * This function checks if the target key exists at the top level of the object.
 * If not, it recursively checks all nested objects for the target key and returns the value if found.
 * If the key is not found in any nested object, it returns `undefined`.
 *
 * @param {Object} obj - The object to search within. Can be a deeply nested object.
 * @param {string} target - The key to search for in the object.
 * @returns {any} The value associated with the target key, or `undefined` if the key is not found.
**/
export const getObjectValueByKey = (obj, target) =>
  target in obj
    ? obj[target]
    : Object.values(obj).reduce((acc, val) => {
      if (acc !== undefined) return acc;
      if (typeof val === 'object') return getObjectValueByKey(val, target);
    }, undefined);

/**
 * Retrieves a localized label using a label code, module name, and internationalization context.
 *
 * @param {string} labelCode - The key used to identify the label (e.g., `'submit'`, `'title'`).
 * @param {{ intl: { formatMessage: function(Object): string } }} context - The internationalization context, typically from `react-intl`.
 * @param {string} [moduleName='main'] - Optional module name for namespacing the label. Defaults to `'main'`.
 */
export const labelsManager = (labelCode, context, moduleName = 'main') => {
  if (!labelCode || !context) return
  return context.intl.formatMessage({
    id: `perun.${moduleName}.${labelCode}`,
    defaultMessage: `perun.${moduleName}.${labelCode}`,
  })
}

/**
 * Retrieves a localized plugin label using the provided label code and context.
 * 
 * @param {string} labelCode - The label code to be appended to the message ID.
 * @param {{ intl: { formatMessage: function(Object): string } }} context - The internationalization context, typically provided by `react-intl`.
 */
export const getPluginLabel = (labelCode, context) => {
  return context.intl.formatMessage({
    id: `perun.plugin.${labelCode}`,
    defaultMessage: `perun.plugin.${labelCode}`
  })
}

/**
 * Custom React hook that returns the previous value of a given input.
 * 
 * This hook uses `useRef` to persist the value across renders and `useEffect` to update the reference after each render.
 * 
 * @param {any} value - The current value to track.
 */
export const usePrevious = (value) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = JSON.parse(JSON.stringify(value))
  }, [value])

  return ref.current
}

/**
 * Updates the text content of the DOM element with ID 'identificationScreen'.
 *
 * If the element exists, its `innerText` is set using a label fetched from `getPluginLabel`
 * with the plugin name and the provided `context`.
 *
 * @param {any} context - Contextual data used to retrieve the appropriate label from `getPluginLabel`.
 */
export const updateIdScreen = (pluginLabel, context) => {
  const idScreen = document.getElementById('identificationScreen')
  if (idScreen) {
    idScreen.innerText = getPluginLabel(pluginLabel, context)
  }
}

/**
 * Recursively flattens a nested object into a single-level object.
 *
 * This function merges nested properties into the top-level object.
 * If a property is an object (and not `null`), its properties are 
 * recursively added to the resulting object. Keys from nested objects 
 * will overwrite keys at higher levels if they have the same name.
 *
 * @param {object} obj - The object to flatten.
 */
export const flattenObject = (obj) => {
  const flattened = {}
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(flattened, flattenObject(obj[key]))
    } else {
      flattened[key] = obj[key]
    }
  })
  return flattened
}

/**
 * Generates a pseudo-random alphanumeric key based on the current timestamp.
 */
export const getDynamicKey = () => {
  return (+ new Date() + Math.floor(Math.random() * 999999)).toString(36)
}

/**
 * Replaces a placeholder in a string path with a provided value.
 *
 * Searches the input string (`wsPath`) for a placeholder in the format `{<id>.OBJECT_ID}`.
 * If found, replaces it with the provided `obj` value. If not found, returns the original string unchanged.
 *
 * @param {string} wsPath - The string path potentially containing the placeholder.
 * @param {string} id - The identifier used to construct the placeholder (e.g., `user` creates `{user.OBJECT_ID}`).
 * @param {string|number} obj - The value to replace the placeholder with.
 */
export const replaceFunc = (wsPath, id, obj) => {
  if (wsPath.indexOf(`{${id}.OBJECT_ID}`) >= 0) {
    wsPath = wsPath.replace(`{${id}.OBJECT_ID}`, obj)
    return wsPath
  } else {
    return wsPath
  }
}