import React from 'react';
import PropTypes from 'prop-types';
import { labelBasePath } from '../../config';
import { WrapItUp, ComponentManager } from '..';
import GenericGrid from './GenericGrid';
import json2csv from 'json2csv';
import xlsx from 'xlsx';

/* This extension component adds a downloadable filter option to the grid,
with every result from the filter in the grid is displayed as a new row in the excel (csv) format.
The header of the excel file represents the filter applied to the grid.
Owner: Kni
Creation date: 21.04.2017 */

/* This function returns a JSON object from a filtered selection, where one object in the array
represents one filtered row. Accepts 2 parameters: grid configuration and array of filtered rows.
The table row names and table data are decoded, using the grid config formatter options functionality,
and as such are saved in the array. Internal system data (such as pkid, object_id, parent_id etc...)
is also automatically removed since it corresponds to no relevant data in the grid config formatter.
If no data was filtered, the function returns an empty array. */
export function prepJsonFromConf (gridConfig, arrOfObj) {
  let cleanArray = []
  if (gridConfig && arrOfObj) {
    const confLen = gridConfig.length
    // create a new array of objects with decoded values
    cleanArray = arrOfObj.map((element) => {
      // create a new object element for each one in data array
      let newElement = {}
      for (let i = 0; i < confLen; i++) {
        const key = gridConfig[i].key
        const formattedKey = gridConfig[i].name
        // see if property defined in config exists in data array
        if (element[key]) {
          let formattedValue = ''
          // if value is a code list, we need to decode it
          if (gridConfig[i].hasOwnProperty('formatterOptions')) { // if object has this property, decode the value
            for (let j = 0; j < gridConfig[i].formatterOptions.length; j++) {
              if (element[key] === gridConfig[i].formatterOptions[j].id) {
                formattedValue = gridConfig[i].formatterOptions[j].text
                break
              }
            }
          } else {
            // if value is not a code just save it in this variable
            formattedValue = element[key]
          }
          newElement[formattedKey] = formattedValue
        } else {
          /* if the field in config is not present in the data array, add an empty string
          so as not to get undefined values in document */
          newElement[formattedKey] = ' '
        }
      }
      // return the newly created decoded element
      return newElement
    })
  }
  // return the new array
  return cleanArray
}

/* A function that returns all rows (or the filtered ones if any filters are present) for selected grid.
Returns JSON or an empty array if there are no records to display. */
function getRows (grid, context) {
  let filterByLabel = context.intl.formatMessage({
    id: `${labelBasePath}.main.grids.filter_by`,
    defaultMessage: `${labelBasePath}.main.grids.filter_by`
  })
  const filterCriteria = []
  let arrOfObj
  let jsonData = []
  const gridConfig = ComponentManager.getStateForComponent(grid, 'gridConfig')
  const filtersObject = ComponentManager.getStateForComponent(grid, 'filters')
  if (filtersObject.constructor === Object && Object.keys(filtersObject).length > 0) {
    arrOfObj = ComponentManager.getStateForComponent(grid, 'filteredRows')
    for (const i in filtersObject) {
      if (filtersObject.hasOwnProperty(i)) {
        const filteredObj = {}
        let filterKey = ''
        let filterTerms = ''
        filterKey = filtersObject[i].column.name
        filterTerms = filtersObject[i].filterTerm
        for (let j = 0; j < filterTerms.length; j++) {
          filteredObj[`${filterByLabel}: ${filterKey}`] = filterTerms[j].label
          filterCriteria.push(filteredObj)
        }
      }
    }
  } else {
    arrOfObj = ComponentManager.getStateForComponent(grid, 'rows')
  }
  // decode all table row names and their respective data- return array of objects
  const filterJson = prepJsonFromConf(gridConfig, arrOfObj)
  if (filterJson.length > 0) {
    jsonData = filterJson.concat(filterCriteria)
  }
  return jsonData
}

/* A function that converts filtered JSON rows to CSV. Creates and downloads a .csv document */
function generateCsv (grid, context) {
  const dataForCsv = getRows(grid, context)
  if (dataForCsv.length > 0) {
    // transform json to csv and create a link which donwloads the document when it is synthetically clicked
    const csv = json2csv.parse(dataForCsv, { withBOM: true })
    const data = new Blob([csv], { type: 'text/csv' }) // eslint-disable-line
    const csvURL = window.URL.createObjectURL(data)
    const tempLink = document.createElement('a')
    tempLink.href = csvURL
    tempLink.setAttribute('download', `${grid}.csv`)
    tempLink.click()
  }
}

/* Download document as Excel .xls or .xlsx format */
function generateExcel (gridId, context, extension) {
  const gridData = getRows(gridId, context)
  if (gridData.length > 0) {
    const filename = `${gridId.toLowerCase()}.${extension}`
    const worksheet = xlsx.utils.json_to_sheet(gridData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet)
    xlsx.writeFile(workbook, filename)
  }
}

const ExportableGrid = (props, context) => {
  return (
    <div id='exportableGridHolder' className='exportableGridHolder'>
      <GenericGrid {...props} />
      { props.gridConfigLoaded && props.gridDataLoaded &&
      <div id='exportBtns' className='exportBtnsHolder' style={{ marginLeft: props.floatDownloadBtnsToRight && 'auto' }}>
        <button
          id='btn_exportCsv'
          className='btn btn-success btnExportCsv'
          onClick={() => generateCsv(props.id, context)}>
          .CSV
        </button>
        <button
          id='export-excel-xls'
          className='btn btn-success btnExportExcel'
          onClick={() => generateExcel(props.id, context, 'xls')}>
          .XLS
        </button>
        <button
          id='export-excel-xlsx'
          className='btn btn-success btnExportExcel'
          onClick={() => generateExcel(props.id, context, 'xlsx')}>
          .XLSX
        </button>
      </div>
      }
    </div>
  )
}

ExportableGrid.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default WrapItUp(ExportableGrid, 'GenericGrid', undefined, true)
