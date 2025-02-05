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

export const downloadFile = (avatar, svSession, stateSet) => {
  if (avatar['objectId'] && avatar['fileName']) {
    const url = `${window.server}/ReactElements/downloadFile/sid/${svSession}/object-id/${avatar['objectId']}/file-name/${avatar['fileName']}`;
    axios
      .get(url, { responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res.data], { type: res.data.type });
        const objectUrl = URL.createObjectURL(blob);
        stateSet(objectUrl)
      })
      .catch(err => {
        console.error('Download error:', err);
      });
  }
};
