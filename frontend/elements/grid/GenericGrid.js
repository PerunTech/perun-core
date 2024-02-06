import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactDataGrid from 'react-data-grid';
import { Data, Editors, Formatters, Filters, Menu } from 'react-data-grid-addons';

import { labelBasePath, translateComponents } from '../../config/config';
import { store, getGridConfig, getGridData, rowClicked, resetGridEditResponseState } from '../../model';
import { WrapItUp, ComponentManager, alertUser } from '..';
import { Loading } from '../../components/ComponentsIndex';

import CustomGridToolbar from './CustomGridToolbar';
import ContextMenuPopup from './ContextMenuPopup';
import { customRowRenderer } from './RowRenderer';
import { customRowRendererSecondary } from './RowRendererSecondary';
import { GridManager } from '..';
import { iconManager } from '../../assets/svg/svgHolder'
import { isValidArray, isValidObject } from '../../functions/utils';
import { strcmp } from '../../model/utils';

const { ContextMenuTrigger } = Menu
const { Selectors } = Data
// Possible values for filters are : NumericFilter, AutoCompleteFilter
const { AutoCompleteFilter } = Filters
const { AutoComplete, DropDownEditor } = Editors
const { AutoCompleteEditor } = AutoComplete
const { DropDownFormatter } = Formatters

/**
 * Represents a instance of a grid. All data from this instance is published in a reducer identified by this instance's ID parameter.
 * @author KNI
 * @version 2.0
 * @class
 */
class GenericGrid extends React.Component {
  /**
 * Default constructor.
 * MANDATORY PARAMETERS
 * @param {string} id - Id of this instance of the grid. This id will be used everewhere throughout the system to identify this grid.
 * @param {string} session - The session which this grid instance will use
 * @param {string} configTableName - Parameter which will be used to call the webservice for configuration ( how many fields, what type etc etc) . If gridType is BASE it will try to find configuration for that table in the database. If gridType is CUSTOM then it will call the webservice with that identifier from config.js and use the data from it to fill the configuration
 * @param {string} dataTableName -  Parameter which will be used to call the webservice for data. If gridType is BASE it will try to find data for that table in the database. If gridType is CUSTOM then it will call the webservice with that identifier from config.js and use the data  that it receives to fill the grid
 *
 * OPTIONAL PARAMETERS
 * @param {array} buttonsArray - creates buttons from the array of objects in CustomGridToolbar (max 3 buttons), the array of object must be in this format (note that the functions should be binded), Example:
  [{
    "name": 'name-example',
    "action": () => this.functionX(),
    "id" : "first"
  }, {
    "name": 'name-example-2',
    "action": () => this.functionY(),
    "id" : "second"
  }]
 * @param {boolean} enableMultiSelect -  Enable or disable row selection
 * @param {function} onSelectChangeFunct - Function which will be called when a change in selected rows happen (rowSelection). See enableMultiSelect.
 * @param {function} addRowSubgrid - Function which will be called when the AddRow button is pressed. No default behaviour
 * @param {function} onRowClickFunct - Function which will be called when a row is clicked. The default behaviour onClick is to publish the row which was clicked into the rowClicked        variable of its own reducer
 * @param {Number} minWidth - Width of the grid. If null it will take 77% of the parent window.
 * @param {Number} minColumnWidth - Minimum width of the columns (in pixels). If null it will take the default value of 80px
 * @param {Number} minHeight - Height of the grid. If null it will take 70% of the parent window.
 * @param {Boolean} defaultHeight - Cancel pre-set value for height 
 * @param {Number} heightRatio - height Ratio
 * @param {string} gridType - Type of grid that needs to be rendered. Can be CUSTOM or null (BASE)
 * @param {Array} params - An array of objects to be replaced during webservice call replacement. The objects inside the array need to be in the following format  :  PARAM_NAME: {nameOfParameter} , PARAM_VALUE : {valueToBeReplaced}. Example usage :
 * @param {String} customToolbarDescription - Toolbar description for grids.
  let params = []
          params.push({
            PARAM_NAME: 'session',
            PARAM_VALUE: this.props.svSession
          }

 * INTERNAL VARIABLES
 * @param {Boolean} gridConfigLoaded - Has the grid configuration been Loaded. Grid rendering directly depends on this variable.
 * @param {JSON} gridConfig - The grid configuration. Internal variable that keeps the whole grid configuration and uses it to render the grid. Loaded from webservice. See  configTableName.
 * @param {Boolean} gridDataLoaded -  Has the grid data been Loaded. Grid rendering directly depends on this variable.
 * @param {JSON} gridData - The grid data. Internal variable that keeps the whole grid data and uses it to render the grid. Loaded from webservice. See  dataTableName.
 * @param {Array} selectedIndexes - Internal variable that keeps the INDEXES of the selectedRows.
 * @param {Array} filters - Internal variable that keeps the filters applied on the rendered grid.
 * @param {JSON} rows - Internal variable that keeps the filters applied on the rendered grid. Is assigned from gridData

 * @param {string} rowKey - Internal variable to know which field represents the unique id for a row.

 * It is mandatory to set gui_metadata params to all fields intended to be sortable, in order to enable the functionality
 * Params used in gui_metadata are =>
 *        sortable=true/false,  - MANDATORY to enable sort for each field, provides a clickable header cell where each sortable field can be sorted by the user, via a toggle cycle of 'ASC/DESC/NONE'
 *        isDefaultSort=true/false,   - sets default column to be sorted on initial render, setting multiple fields per table possible (not advisable)
 *        defaultSortDirection='ASC/DESC' - sets default sort direction on initial render, use together with isDefaultSort, if param is ommited it will revert to DESC
 * @param {string} sortColumn - Internal variable to set which field to sort, matches field by internal column name
 * @param {string} sortDirection - Internal variable to know direction of sorted column, used in conjuction with sortColumn
 * @param {boolean/function} refreshData - true/false default refresh btn top righ toolbar

 */
  constructor(props) {
    super(props)
    this.state = {
      addRowSubgrid: this.props.addRowSub,
      customButton: this.props.customButton,
      customButtonLabel: this.props.customButtonLabel,
      toggleCustomButton: this.props.toggleCustomButton,
      hasLinkGridInModal: this.props.hasLinkGridInModal,
      onRowClickFunct: this.props.onRowClickFunct,
      onSelectChangeFunct: this.props.onSelectChangeFunct,
      handleRowUpdatedFunct: this.props.handleRowUpdatedFunct,
      saveAllRecords: this.props.saveAllRecords,

      id: this.props.id,
      params: this.props.params,
      gridType: this.props.gridType,
      configTableName: this.props.configTableName,
      dataTableName: this.props.dataTableName,
      enableMultiSelect: this.props.enableMultiSelect,
      minWidth: this.props.minWidth,
      minColumnWidth: this.props.minColumnWidth,
      minHeight: this.props.minHeight,
      gridConfigLoaded: this.props.gridConfigLoaded,
      gridConfig: this.props.gridConfig,
      gridDataLoaded: this.props.gridDataLoaded,
      gridData: this.props.gridData,
      selectedIndexes: [],
      selectedIndexesBeforeFilters: [],
      selectedRowsBeforeFilters: [],
      filters: [],
      rows: this.props.gridData,
      session: this.props.session,
      rowKey: `${this.props.configTableName}.PKID`,
      alert: undefined,
      requestPending: false,
      active: true,
      hideLoader: false,

      buttonsArray: this.props.buttonsArray,

      additionalButton: this.props.additionalButton,
      additionalButtonLabel: this.props.additionalButtonLabel,
      customButtonClassName: this.props.customButtonClassName,
      customButtonTitle: this.props.customButtonTitle,
      className: this.props.className,
      additionalButtonClassName: this.props.additionalButtonClassName,
      refreshData: this.props.refreshData,
    }

    this.rowGetter = this.rowGetter.bind(this)
    this.onRowsSelected = this.onRowsSelected.bind(this)
    this.onRowsDeselected = this.onRowsDeselected.bind(this)
    this.onClearFilters = this.onClearFilters.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.getRows = this.getRows.bind(this)
    this.getSize = this.getSize.bind(this)
    this.onRowClick = this.onRowClick.bind(this)
    this.generateEditorFromConfig = this.generateEditorFromConfig.bind(this)
    this.generateFormatterFromConfig = this.generateFormatterFromConfig.bind(this)
    this.handleRowUpdated = this.handleRowUpdated.bind(this)
    this.onSelectedRowsChange = this.onSelectedRowsChange.bind(this)
    this.jsonPrepareObjectForSvarog = this.jsonPrepareObjectForSvarog.bind(this)
    this.getGridConfig = this.getGridConfig.bind(this)
    this.getGridData = this.getGridData.bind(this)
    this.getValidFilterValues = this.getValidFilterValues.bind(this)
    this.addRow = this.addRow.bind(this)
    this.columnValueContainsSearchTerms = this.columnValueContainsSearchTerms.bind(this)
    this.filterValues = this.filterValues.bind(this)
    this.saveAllRecords = this.saveAllRecords.bind(this)
    this.mouseOn = this.mouseOn.bind(this)
    this.mouseOff = this.mouseOff.bind(this)
    this.handleGridSort = this.handleGridSort.bind(this)
  }
  /**
  * Internal function to generate a new Editor for fields that have the appropriate configuration.
  */
  generateEditorFromConfig(editorConfig) {
    let retval = null
    const editorType = editorConfig.editorType
    const editorOptions = editorConfig.editorOptions

    switch (editorType) {
      case 'DropDownEditor':
        if (editorOptions !== null && editorOptions !== undefined && editorConfig.editable) {
          retval = <DropDownEditor options={editorOptions} />
        } else if (editorOptions === null || editorOptions === undefined) {
          console.warn('No configuration provided')
        }
        break
      case 'AutoCompleteEditor':
        if (editorOptions !== null && editorOptions !== undefined) {
          retval = <AutoCompleteEditor options={editorOptions} />
        } else {
          console.warn('No configuration provided')
        }
        break
      default:
        retval = null
    }

    return retval
  }
  /**
 * Internal function to generate a new Formatter for fields that have the appropriate configuration.
 */
  generateFormatterFromConfig(editorConfig) {
    let retval = null
    const editorType = editorConfig.formatterType
    const editorOptions = editorConfig.formatterOptions

    switch (editorType) {
      case 'DropDownFormatter':
        if (editorOptions !== null && editorOptions !== undefined) {
          retval = <DropDownFormatter value='' options={editorOptions} />
        } else {
          console.log('FS bad config')
        }
        break

      default:
        retval = null
    }

    return retval
  }

  /**
 * Convert dates from string into javascript short date format
 * @author KNI
 * @version 1.0
 * @function
 * PARAMETERS
 * @param {JSON} gridConfig - the grid configuration object
 * @param {JSON} gridData - grid data object
 */
  formatDates(gridConfig, gridData) {
    for (let c = 0; c < gridConfig.length; c++) {
      if (gridConfig[c].datetype) {
        for (let d = 0; d < gridData.length; d++) {
          if (gridData[d][gridConfig[c].key]) {
            const oldDate = gridData[d][gridConfig[c].key]
            // cast the date string as javascript full date format (object)
            if (oldDate.indexOf('T') > -1 && oldDate.indexOf('+') > -1) {
              const date = new Date(oldDate)
              if (gridConfig[c].datetype === 'shortdate') {
                let year = date.getFullYear()
                let month = date.getMonth() + 1
                let day = date.getDate()
                if (day < 10) {
                  day = '0' + day
                }
                if (month < 10) {
                  month = '0' + month
                }
                if (day && month && year) {
                  const newDate = `${day}/${month}/${year}`
                  gridData[d][gridConfig[c].key] = newDate
                }
              } else if (gridConfig[c].datetype === 'longdate') {
                let year = date.getFullYear()
                let month = date.getMonth() + 1
                let day = date.getDate()
                let hours = date.getHours()
                let minutes = date.getMinutes()
                let seconds = date.getSeconds()
                if (day < 10) {
                  day = '0' + day
                }
                if (month < 10) {
                  month = '0' + month
                }
                if (hours < 10) {
                  hours = '0' + hours
                }
                if (minutes < 10) {
                  minutes = '0' + minutes
                }
                if (seconds < 10) {
                  seconds = '0' + seconds
                }
                if (day && month && year && hours && minutes && seconds) {
                  const newDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
                  gridData[d][gridConfig[c].key] = newDate
                }
              }
            }
          }
        }
      }
    }
    let formattedData = gridData
    return formattedData
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Refresh state if new labels are loaded
    // if (nextProps.gridLang && (this.props.gridLang !== nextProps.gridLang)) {
    //   this.forceUpdate()
    // }

    for (const key in nextProps) {
      const value = nextProps[key]
      this.setState({ [key]: value })
    }
    const currGrid = nextProps.gridConfig
    if (currGrid != null && isValidArray(currGrid, 1)) {
      for (let i = 0; i < currGrid.length; i++) {
        const elementstatus = currGrid[i]
        const editorData = this.generateEditorFromConfig(elementstatus)
        const formatterData = this.generateFormatterFromConfig(elementstatus)
        if (editorData !== null && editorData !== undefined) { elementstatus.editor = editorData }
        if (formatterData !== null && formatterData !== undefined) {
          elementstatus.formatter = formatterData
          const filterRendered = AutoCompleteFilter
          elementstatus.filterRenderer = filterRendered
        }
        if (elementstatus.isDefaultSort && (this.state.sortColumn === undefined && this.state.sortDirection === undefined)) {
          this.setState({ sortColumn: elementstatus.key, sortDirection: elementstatus.defaultSortDirection ? elementstatus.defaultSortDirection : 'DESC' })
        }
      }
      // replace grid headers (element.name) with labels, labels are element.key.toLowerCase()
      translateComponents && currGrid && currGrid.map((element) => {
        // enable to easily copy from chrome dev console, i.e copy(temp1)
        // return [`${labelBasePath}.grid_labels.${element.key.toLowerCase()}=${element.name}`]
        element.name = this.context.intl.formatMessage({
          id: `${labelBasePath}.grid_labels.${element.key.toLowerCase()}`,
          defaultMessage: `${labelBasePath}.grid_labels.${element.key.toLowerCase()}`
        })
      })
      this.setState({ gridConfig: currGrid })
    }
    if (nextProps.gridData && nextProps.gridConfig) {
      // this.setState({ rows: nextProps.gridData })
      const formattedData = this.formatDates(nextProps.gridConfig, nextProps.gridData)
      this.setState({ rows: formattedData })
    }

    if (nextProps.reloadGrid !== null && nextProps.reloadGrid !== undefined) {
      if (nextProps.reloadGrid === true && this.state.gridDataLoaded === true && this.state.reloadGrid !== nextProps.reloadGrid) {
        this.setState({ gridDataLoaded: false }, () => {
          this.getGridData(nextProps.params, { configTableName: nextProps.configTableName, dataTableName: nextProps.dataTableName })
        })
      }
    }

    if ((this.props.gridConfigLoaded !== nextProps.gridConfigLoaded || this.props.gridConfig !== nextProps.gridConfig) &&
      nextProps.gridConfigLoaded === false) {
      let errorMessage = 'A system error occured, please contact the IT administrator.'
      try {
        errorMessage = nextProps.gridConfig.response.data
      } catch (error) {
        console.log(error)
      } finally {
        this.setState({
          hideLoader: true,
          alert: alertUser(
            true, 'error',
            this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.load_config_failed`, defaultMessage: `${labelBasePath}.main.grids.load_config_failed` }),
            errorMessage,
            () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, undefined
          )
        })
      }
    }

    if (this.props.gridDataLoaded !== nextProps.gridDataLoaded || this.props.gridData !== nextProps.gridData) {
      if (nextProps.gridDataLoaded === false && nextProps.gridData.constructor !== Array) {
        let errorMessage = 'A system error occured, please contact the IT administrator.'
        try {
          errorMessage = nextProps.gridData.response.data
        } catch (error) {
          console.log(error)
        } finally {
          this.setState({
            hideLoader: true,
            alert: alertUser(
              true, 'error',
              this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.load_data_failed`, defaultMessage: `${labelBasePath}.main.grids.load_data_failed` }),
              errorMessage,
              () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, undefined
            )
          })
        }
      }
    }

    if (nextProps.inlineSaveResult && (nextProps.inlineSaveResult !== this.props.inlineSaveResult)) {
      this.setState({ requestPending: false })
      if (nextProps.inlineSaveResult.type === 'ERROR' || nextProps.inlineSaveResult.type === 'EXCEPTION') {
        this.setState({
          hideLoader: true,
          alert: alertUser(
            true, 'error', nextProps.inlineSaveResult.title, nextProps.inlineSaveResult.message,
            () => {
              this.setState({ alert: alertUser(false, 'info', ' ') })
              store.dispatch(resetGridEditResponseState(this.state.id))
              this.updateRowsAfterSave(this, nextProps)
            }, undefined, false, undefined, undefined, false, undefined)
        })
      } else {
        this.updateRowsAfterSave(this, nextProps)
      }
    }

    if (nextProps.saveAllResult && (nextProps.saveAllResult !== this.props.saveAllResult)) {
      this.setState({ requestPending: false })
      this.setState({
        alert: alertUser(
          true, 'info', nextProps.saveAllResult.title, nextProps.saveAllResult.message,
          () => {
            store.dispatch(resetGridEditResponseState(this.state.id))
            this.setState({ alert: alertUser(false, 'info', ' ') }, () => this.onClearFilters())
          }, undefined, false, undefined, undefined, false, undefined)
      })
    }

    // if (nextProps.gridConfig && nextProps.gridData) {
    //   const formattedData = this.formatDates(nextProps.gridConfig, nextProps.gridData)
    //   this.setState({ rows: formattedData })
    // }
  }

  updateRowsAfterSave(comp, nextProps) {
    const savedObject = nextProps.inlineSaveResult.data
    const rowId = savedObject.ROW_ID
    delete savedObject.ROW_ID
    let rows = Selectors.getRows(this.state)
    let filteredRows = comp.state.filteredRows
    if (filteredRows && filteredRows.constructor === Array) {
      if (filteredRows.length > 0) {
        // ComponentManager.setStateForComponent(this.state.id, null, 'reloadGrid', true)
        this.getGridData()
      }
    } else {
      // rows = comp.state.gridData.slice()
      rows[rowId] = savedObject
      this.setState({ gridData: rows })
    }
    store.dispatch(resetGridEditResponseState(comp.state.id))
  }
  onSelectedRowsChange(rows) {
    if (this.state.onSelectChangeFunct !== null && this.state.onSelectChangeFunct !== undefined) {
      this.state.onSelectChangeFunct(rows, this.state.id)
    } else {
      console.log('running local change')
    }
  }

  UNSAFE_componentWillMount() {
    this.getGridConfig()
    if (!this.state.gridDataLoaded) {
      this.getGridData(this.state.params)
    }
    if (this.state.filters || this.state.filteredRows || this.state.selectedIndexes) {
      ComponentManager.setStateForComponent(this.state.id, null, { filteredRows: undefined, filters: [], selectedIndexes: [] })
    }
  }

  filterValues(row, columnFilter, columnKey) {
    let include = true
    if (columnFilter === null) {
      include = false
    } else if (!(Array.isArray(columnFilter.filterTerm) && columnFilter.filterTerm.length === 0)) {
      include = this.columnValueContainsSearchTerms(row[columnKey], columnFilter.filterTerm)
    }
    return include
  }

  columnValueContainsSearchTerms(columnValue, filterTerms) {
    let columnValueContainsSearchTerms = false
    for (const key in filterTerms) {
      if (!Object.prototype.hasOwnProperty.call(filterTerms, key)) {
        continue
      }
      if (columnValue !== undefined && filterTerms[key].value !== undefined) {
        const strColumnValue = columnValue.toString()
        const filterTermValue = filterTerms[key].value.toString()
        if (strColumnValue === filterTermValue) {
          columnValueContainsSearchTerms = true
          break
        }
      }
    }
    return columnValueContainsSearchTerms
  }

  getGridConfig() {
    store.dispatch(getGridConfig(this.state.id, this.state.configTableName, this.state.session, this.state.params, this.state.gridType))
  }

  getGridData(params, getNewData) {
    if (getNewData) {
      store.dispatch(getGridData(this.state.id, getNewData.dataTableName, this.state.session, params, this.state.gridType, 100))
    } else {
      store.dispatch(getGridData(this.state.id, this.state.dataTableName, this.state.session, params, this.state.gridType, 100))
    }
  }

  handleFilterChange(filter) {
    const newFilters = Object.assign({}, this.state.filters)
    if (filter.filterTerm) {
      if (filter.column.formatterType !== null && filter.column.formatterType !== undefined && filter.column.formatterType === 'DropDownFormatter') {
        filter.filterValues = this.filterValues
      }
      newFilters[filter.column.key] = filter
    } else {
      delete newFilters[filter.column.key]
    }

    const filteredRows = Selectors.getRows({ filters: newFilters, rows: this.state.rows })
    let selectedIndexes = []
    // Check for cases when no filters have values
    if (!isValidObject(newFilters, 1)) {
      // Set the selected indexes to the persisted ones, if there are any
      if (isValidArray(this.state.selectedIndexesBeforeFilters, 1)) {
        selectedIndexes = this.state.selectedIndexesBeforeFilters
      }
    } else {
      const { selectedRowsBeforeFilters } = this.state
      const allFilteredRows = filteredRows
      // Get the object IDs of the selected rows before the filters were applied
      const selectedRowsObjIds = selectedRowsBeforeFilters.map(row => {
        for (const [key, value] of Object.entries(row)) {
          if (strcmp(key.split('.')[1], 'OBJECT_ID')) {
            return value
          }
        }
      })
      // Get the object IDs of the filtered out rows
      const filteredRowsObjIds = allFilteredRows.map(row => {
        for (const [key, value] of Object.entries(row)) {
          if (strcmp(key.split('.')[1], 'OBJECT_ID')) {
            return value
          }
        }
      })
      // Check if the initially selected rows are contained in the filtered out rows and appropriately mark their indexes as selected
      const filteredSelectedIndexes = selectedRowsObjIds.map(row => {
        const index = filteredRowsObjIds.indexOf(row)
        if (index > -1) {
          return index
        }
      }).filter(item => item !== undefined)

      selectedIndexes = filteredSelectedIndexes
    }
    this.setState({ filteredRows, filters: newFilters, selectedIndexes })
  }

  onClearFilters() {
    // all filters removed
    let selectedIndexes = []
    if (isValidArray(this.state.selectedIndexesBeforeFilters, 1)) {
      selectedIndexes = this.state.selectedIndexesBeforeFilters
    }
    this.setState({ filteredRows: undefined, filters: [], selectedIndexes })
  }

  onRowsSelected(rows) {
    if (!isValidObject(this.state.filters, 1)) {
      const LocalIndexes = this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))
      const allRows = Selectors.getRows(this.state)
      const toSend = LocalIndexes.map(r => allRows[r])

      this.setState({ selectedIndexes: LocalIndexes, selectedIndexesBeforeFilters: LocalIndexes, selectedRowsBeforeFilters: toSend })
      this.onSelectedRowsChange(toSend, this.state.id)
    } else {
      const { selectedIndexesBeforeFilters, selectedRowsBeforeFilters } = this.state
      const allRows = this.state.rows
      let selectedIndexes = selectedIndexesBeforeFilters
      // Get the object IDs of all the rows
      const allRowsObjIds = allRows.map(row => {
        for (const [key, value] of Object.entries(row)) {
          if (strcmp(key.split('.')[1], 'OBJECT_ID')) {
            return value
          }
        }
      })
      // Get the currently selected row(s) & find its(their) object ID(s)
      rows.forEach(r => {
        const currentlySelectedRow = r.row
        let currentlySelectedRowObjId = 0
        for (const [key, value] of Object.entries(currentlySelectedRow)) {
          if (strcmp(key.split('.')[1], 'OBJECT_ID')) {
            currentlySelectedRowObjId = value
          }
        }
        // Find the initial position (before the filters were applied) of the currently selected row(s)
        const initialIndexOfTheCurrentRow = allRowsObjIds.indexOf(currentlySelectedRowObjId)
        // Add the current row index & the full row object to the appropriate arrays
        selectedIndexes.push(initialIndexOfTheCurrentRow)
        selectedRowsBeforeFilters.push(currentlySelectedRow)
      })
      const LocalIndexes = this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))

      this.setState({ selectedIndexes: LocalIndexes, selectedIndexesBeforeFilters: selectedIndexes, selectedRowsBeforeFilters })
      this.onSelectedRowsChange(selectedRowsBeforeFilters, this.state.id)
    }
  }

  onRowsDeselected(rows) {
    if (!isValidObject(this.state.filters, 1)) {
      const rowIndexes = rows.map(r => r.rowIdx)
      const LocalIndexes = this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1)
      const allRows = Selectors.getRows(this.state)
      const toSend = LocalIndexes.map(r => allRows[r])

      this.setState({ selectedIndexes: LocalIndexes, selectedIndexesBeforeFilters: LocalIndexes, selectedRowsBeforeFilters: toSend })
      this.onSelectedRowsChange(toSend, this.state.id)
    } else {
      const { selectedIndexesBeforeFilters, selectedRowsBeforeFilters } = this.state
      const rowIndexes = rows.map(r => r.rowIdx)
      const allRows = this.state.rows
      const selectedIndexes = selectedIndexesBeforeFilters
      const selectedRows = selectedRowsBeforeFilters
      // Get the object IDs of all the rows
      const allRowsObjIds = allRows.map(row => {
        for (const [key, value] of Object.entries(row)) {
          if (strcmp(key.split('.')[1], 'OBJECT_ID')) {
            return value
          }
        }
      })
      // Get the currently selected row & find its object ID
      const currentlySelectedRow = rows[0].row
      let currentlySelectedRowObjId = 0
      for (const [key, value] of Object.entries(currentlySelectedRow)) {
        if (strcmp(key.split('.')[1], 'OBJECT_ID')) {
          currentlySelectedRowObjId = value
        }
      }
      // Find the initial position (before the filters were applied) of the currently selected row
      const initialIndexOfTheCurrentRow = allRowsObjIds.indexOf(currentlySelectedRowObjId)
      // Find the index that needs to be removed in the array of indexes & remove it
      const indexToRemove = selectedIndexes.indexOf(initialIndexOfTheCurrentRow)
      selectedIndexes.splice(indexToRemove, 1)
      // Filter out the row whose object ID matches the one of the current row
      const newSelectedRows = selectedRows.map(row => {
        for (const [key, value] of Object.entries(row)) {
          if (strcmp(key.split('.')[1], 'OBJECT_ID')) {
            return value !== currentlySelectedRowObjId && row
          }
        }
      }).filter(row => isValidObject(row, 1))
      const LocalIndexes = this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1)
      this.setState({ selectedIndexes: LocalIndexes, selectedIndexesBeforeFilters: selectedIndexes, selectedRowsBeforeFilters: newSelectedRows })
      this.onSelectedRowsChange(newSelectedRows, this.state.id)
    }
  }

  jsonPrepareObjectForSvarog(tmpObject, tableNameDot) {
    let svarogString1 = '' // to package svarog data
    let svarogString2 = '' // to package rest of the data
    for (let key in tmpObject) {
      if (key.includes(tableNameDot) === true) {
        let value = tmpObject[key]
        const tableNAme = key.substring(0, key.indexOf('.'))
        key = key.replace(`${tableNAme}.`, '')
        if (value === null || value === undefined) {
          value = ''
        }
        if (key === 'PKID' || key === 'OBJECT_ID' || key === 'DT_INSERT' || key === 'DT_DELETE' || key === 'PARENT_ID' || key === 'OBJECT_TYPE' || key === 'STATUS' || key === 'USER_ID') {
          // has to be lowecase but does not matter if its integer in string object
          svarogString1 = `${svarogString1}"${key.toLowerCase()}"` + `:` + `"${value}"` + `,`
        } else {
          // if we have integer value dont put in ""
          if (isNaN(value)) {
            svarogString2 = `${svarogString2}{"${key.toUpperCase()}"` + `:` + `"${value}"},`
          } else
            if (value === '') {
              svarogString2 = svarogString2 + '{"' + key.toUpperCase() + '"' + ':\"\"},' // eslint-disable-line
            } else {
              svarogString2 = `${svarogString2}{"${key.toUpperCase()}"` + `:${value}},`
            }
        }
      }
    }

    svarogString2 = svarogString2.substring(0, svarogString2.length - 1) // remove the coma at the end
    const returnstring = `${'{' + '"' + 'com.prtech.svarog_common.DbDataObject' + '"' + ':{'}${svarogString1}"` + `values` + `"` + `:[${svarogString2}]}}`
    return returnstring
  }

  getRows() {
    const filteredRows = Selectors.getRows(this.state)
    return filteredRows
  }

  rowGetter(i) {
    const rows = this.getRows()
    return rows[i]
  }

  getSize() {
    return this.getRows().length
  }

  onRowClick(rowIdx, row) {
    if (rowIdx > -1 && !this.state.handleRowUpdatedFunct) {
      store.dispatch(rowClicked(this.state.id, row, rowIdx))
      if (this.state.onRowClickFunct && (typeof this.state.onRowClickFunct === 'function')) {
        this.state.onRowClickFunct(this.state.id, rowIdx, row)
      } else if (this.state.onRowClickFunct && !(typeof this.state.onRowClickFunct === 'function')) {
        console.warn('Cannot invoke onRowClick since it is not a function.')
      }
    }
  }

  handleRowUpdated(commit) {
    if (this.state.active && this.state.handleRowUpdatedFunct) {
      this.setState({ requestPending: true })
      let rows = Selectors.getRows(this.state)
      /* const filteredRows = this.state.filteredRows
      if (filteredRows && filteredRows.constructor === Array) {
        if (filteredRows.length > 0) {
          rows = filteredRows.slice()
        }
      } */
      this.state.handleRowUpdatedFunct(this, rows, commit.fromRow, commit.updated)
    } else {
      console.warn('No inline grid save function provided. No default function found.')
    }
  }

  saveAllPrompt(c, rows) {
    c.setState({
      alert: alertUser(true,
        'warning',
        c.context.intl.formatMessage({ id: `${labelBasePath}.main.save_all_records_prompt_title`, defaultMessage: `${labelBasePath}.main.save_all_records_prompt_title` }),
        c.context.intl.formatMessage({ id: `${labelBasePath}.main.save_all_records_prompt_message`, defaultMessage: `${labelBasePath}.main.save_all_records_prompt_message` }),
        () => {
          c.setState({ requestPending: true })
          c.state.saveAllRecords(c, rows)
        },
        () => c.setState({ alert: alertUser(false, 'info', ' ') }),
        true,
        c.context.intl.formatMessage({ id: `${labelBasePath}.main.forms.save_all`, defaultMessage: `${labelBasePath}.main.forms.save_all` }),
        c.context.intl.formatMessage({ id: `${labelBasePath}.main.forms.cancel`, defaultMessage: `${labelBasePath}.main.forms.cancel` }),
        true,
        '#78aa22',
        true
      )
    })
  }

  saveAllRecords() {
    if (this.state.saveAllRecords) {
      let rows = []
      const filteredRows = this.state.filteredRows
      const filters = this.state.filters
      if (Object.keys(filters).length > 0 && filters.constructor === Object) {
        if (filteredRows && filteredRows.constructor === Array) {
          if (filteredRows.length > 0) {
            rows = filteredRows.slice()
            this.saveAllPrompt(this, rows)
          } else {
            this.setState({
              alert: alertUser(true,
                'info',
                this.context.intl.formatMessage({ id: `${labelBasePath}.main.invalid_filter`, defaultMessage: `${labelBasePath}.main.invalid_filter` }),
                '',
                () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined,
                undefined, undefined, true
              )
            })
          }
        }
      } else {
        this.saveAllPrompt(this, rows)
      }
    }
  }

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    const rows = this.state.rows.slice()
    for (let i = fromRow; i <= toRow; i++) {
      const rowToUpdate = rows[i]
      const updatedRow = React.addons.update(rowToUpdate, { $merge: updated })
      rows[i] = updatedRow
    }

    this.setState({ rows })
  }

  componentDidUpdate() {
    this.props.refFunction(this)
  }

  getValidFilterValues(columnId) {
    const keys = this.state.rows.map(r => r[columnId])
    let config = null
    const columns = this.state.gridConfig
    for (let i = 0; i < columns.length; i++) {
      const obj = columns[i]
      if (obj.key === columnId) {
        config = obj
        break
      }
    }
    if (config != null) {
      const formOptions = config.formatterOptions
      var values = keys.map((r) => {
        for (let i = 0; i < formOptions.length; i++) {
          const obj = formOptions[i]
          if (obj.id === r) {
            // currval = obj;
            var currval = {

              value: obj.value,
              label: obj.title

            }
            break
          }
        }

        return currval
      })
    }

    const retval = values.filter((currentValue, index, arr) => {
      let cnt = 0
      for (let i = 0; i < arr.length; i++) {
        const obj = arr[i]
        if (currentValue !== null && currentValue !== undefined && obj !== null && obj !== undefined) {
          if (obj.value !== null && obj.value !== undefined && currentValue.value !== null && currentValue.value !== undefined && obj.label !== null && obj.label !== undefined && currentValue.label !== null && currentValue.label !== undefined) {
            if (obj.value === currentValue.value && obj.label === currentValue.label) {
              if (i === index) {
                cnt = 1
                break
              } else {
                cnt = 0
                break
              }
            }
          }
        }
      }
      return cnt === 1
    })

    return retval
  }

  addRow() {
    if (this.state.addRowSubgrid) this.state.addRowSubgrid()
  }

  handleGridSort = (sortColumn, sortDirection) => {
    this.setState({ sortColumn, sortDirection })
  }

  // some vodoo black magic copied from functions already
  // present in this component modified to work with customButton
  customButton = () => {
    const { customButton, toggleCustomButton } = this.state

    if (toggleCustomButton && customButton) {
      customButton()
    }


  }

  mouseOn() {
    this.setState({ active: true })
  }

  mouseOff() {
    this.setState({ active: false })
  }

  refreshData = () => {
    if (typeof this.state.refreshData === 'boolean') {
      GridManager.reloadGridData(this.state.id)
    } else {
      if (typeof this.state.refreshData === 'function') {
        this.state.refreshData()
      } else {
        alertUser(true, 'info', this.context.intl.formatMessage(
          { id: `${labelBasePath}.error.refresh_data`, defaultMessage: `${labelBasePath}.error.refresh_data` }
        ))
      }
    }
  }

  render() {
    const rowText = this.state.selectedIndexes.length === 1
      ? this.context.intl.formatMessage(
        { id: `${labelBasePath}.row_selected`, defaultMessage: `${labelBasePath}.row_selected` }
      ) : this.context.intl.formatMessage(
        { id: `${labelBasePath}.rows_selected`, defaultMessage: `${labelBasePath}.rows_selected` }
      )

    let finalHeight
    let heightRatio = 0.8
    let className = this.state.className

    if (this.props.heightRatio) {
      heightRatio = this.props.heightRatio
    }

    if (!this.props.defaultHeight) {
      finalHeight = this.state.minHeight > 0 ? this.state.minHeight : (window.innerHeight * heightRatio)
    }
    // const finalWidth = this.state.minWidth > 0 ? this.state.minWidth : (window.innerWidth * 0.772)
    const rowClicked = this.state.rowClicked || undefined

    const imgHeight = finalHeight / 10
    const margin = (finalHeight / 2) - imgHeight

    if (!className) {
      className = 'reactGrid'
    }

    const NoData = () => {
      /* Displays a message and an image inside the grid when no rows are retreived
      The image must be supplied from outside the components package */
      return <div style={{ 'marginTop': margin, 'fontWeight': 'bold' }}>
        {this.context.intl.formatMessage({
          id: `${labelBasePath}.main.grids.no_data`,
          defaultMessage: `${labelBasePath}.main.grids.no_data`
        })}
        <br />
        {iconManager.getIcon('emptyBox')}
      </div>
    }

    return (
      <div>
        {this.state.alert}
        {(!this.state.gridConfigLoaded || !this.state.gridDataLoaded || this.state.requestPending) && !this.state.hideLoader &&
          <div>
            <Loading />
          </div>
        }

        {this.state.gridConfigLoaded && this.state.gridDataLoaded && this.state.gridConfig &&
          <div id={className} className={className}>
            <div id='separateText' className='separator' />
            {/* <div id='dataHolderCss' className='dataHolderCss' /* onMouseEnter={this.mouseOn} onMouseLeave={this.mouseOff}> */}
            <ReactDataGrid
              enableCellSelect
              rowKey={this.state.rowKey}
              columns={this.state.gridConfig}
              rowGetter={this.rowGetter}
              rowsCount={this.getSize()}
              // minWidth={finalWidth}
              minHeight={finalHeight}
              minColumnWidth={this.state.minColumnWidth}
              className={this.state.className}
              headerRowHeight={50}
              toolbar={
                <CustomGridToolbar
                  // onMouseEnter={this.mouseOff}
                  // onMouseLeave={this.mouseOn}
                  enableFilter
                  hasLinkGridInModal={this.state.hasLinkGridInModal}
                  {...this.state.toggleCustomButton && { buttonsArray: this.state.buttonsArray }}
                  {...this.state.toggleCustomButton && { customButtonLabel: this.state.customButtonLabel }}
                  {...this.state.toggleCustomButton && { additionalButtonLabel: this.state.additionalButtonLabel }}
                  {...this.state.toggleCustomButton && { additionalButton: this.state.additionalButton }}
                  {...this.state.toggleCustomButton && { customButton: this.customButton }}
                  {...this.state.addRowSubgrid && { onAddRow: this.addRow }}
                  {...this.state.toggleCustomButton && { customButtonClassName: this.state.customButtonClassName }}
                  {...this.state.toggleCustomButton && { additionalButtonClassName: this.state.additionalButtonClassName }}
                  {...this.state.toggleCustomButton && { customButtonTitle: this.state.customButtonTitle }}
                  addRowButtonText={
                    this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.add`, defaultMessage: `${labelBasePath}.main.grids.add` })
                  }
                  filterRowsButtonText={
                    this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.search`, defaultMessage: `${labelBasePath}.main.grids.search` })
                  }
                >{this.state.saveAllRecords &&
                  <button id='saveAllRecords' className='btn' onClick={this.saveAllRecords}>
                    {this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.apply_all`, defaultMessage: `${labelBasePath}.main.grids.apply_all` })}
                  </button>
                  }
                  {this.state.refreshData &&
                    <span id='refreshData' className='refreshData' title="Освежи податоци" onClick={this.refreshData}>
                      {/* {this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.refreshData`, defaultMessage: `${labelBasePath}.main.grids.refreshData` })} */}
                      {iconManager.getIcon('refreshGrid')}
                    </span>
                  }
                  {(this.state.filteredRows && this.state.filteredRows.length > 0 && this.state.rows)
                    ? <span id='reactGridspan1'>{this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.rowcount`, defaultMessage: `${labelBasePath}.main.grids.rowcount` })} {this.state.filteredRows.length}</span>
                    : <span id='reactGridspan2'>{this.context.intl.formatMessage({ id: `${labelBasePath}.main.grids.rowcount`, defaultMessage: `${labelBasePath}.main.grids.rowcount` })} {this.state.rows.length}</span>
                  }
                  {this.props.customToolbarDescription &&
                    <span id='customToolbarMsg' style={{ paddingLeft: '2px' }}>{this.props.customToolbarDescription}</span>}

                  {this.state.enableMultiSelect === true &&
                    <span id='reactGridspan3' style={{ paddingLeft: '10px' }}>{`${this.state.selectedIndexes.length} ${rowText}`}</span>
                  }
                </CustomGridToolbar>
              }
              onAddFilter={this.handleFilterChange}
              onClearFilters={this.onClearFilters}
              onRowClick={this.onRowClick}
              getValidFilterValues={this.getValidFilterValues}
              onGridRowsUpdated={this.handleRowUpdated}
              rowRenderer={customRowRendererSecondary()}
              {...rowClicked && { rowRenderer: customRowRenderer(rowClicked.ROW_ID, rowClicked) }}
              rowSelection={this.state.enableMultiSelect === true ? {
                showCheckbox: true,
                enableShiftSelect: true,
                onRowsSelected: this.onRowsSelected,
                onRowsDeselected: this.onRowsDeselected,
                selectBy: {
                  indexes: this.state.selectedIndexes
                }
              } : null}
              onGridSort={this.handleGridSort}
              RowsContainer={ContextMenuTrigger}
              contextMenu={<ContextMenuPopup
                rows={this.state.filteredRows || this.state.rows}
                id={this.state.id}
                enableMultiSelect={this.state.enableMultiSelect}
                gridConfig={this.state.gridConfig}
                editContextFunc={this.props.editContextFunc} />
              }
              emptyRowsView={NoData}
            />
            {/* </div> */}
          </div>
        }
      </div>
    )
  }
}

GenericGrid.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  gridLang: state.intl.locale
})

export default WrapItUp(connect(mapStateToProps)(GenericGrid), 'GenericGrid', undefined, true)