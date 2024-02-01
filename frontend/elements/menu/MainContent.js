import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import createHashHistory from 'history/createHashHistory';
import Draggable from 'react-draggable';
import { translateComponents } from '../../config/config';
import { menuConfig } from '../../config/menuConfig'
import { store, lastSelectedItem } from '../../model';
import { ComponentManager, FormManager, GridManager } from '..';

const hashHistory = createHashHistory()

class MainContent extends React.Component {
  static propTypes = {
    gridToDisplay: PropTypes.string.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      showPopup: false,
      popUpForm: undefined,
      renderGrid: undefined
    }
    this.generateGrid = this.generateGrid.bind(this)
    this.generateForm = this.generateForm.bind(this)
    this.insertNewRow = this.insertNewRow.bind(this)
    this.onRowSelect = this.onRowSelect.bind(this)
    this.closeWindow = this.closeWindow.bind(this)
    this.onAlertClose = this.onAlertClose.bind(this)
  }

  componentDidMount () {
    if (this.props) {
      this.generateGrid(this.props)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.gridLang && (this.props.gridLang !== nextProps.gridLang)) {
      !translateComponents && this.forceUpdate()
      translateComponents && GridManager.reloadGridData(this.props.gridToDisplay)
    }
    if ((this.props.gridToDisplay !== nextProps.gridToDisplay) || (nextProps.toggleCustomButton !== this.props.toggleCustomButton)) {
      this.generateGrid(nextProps)
    }
  }

  generateGrid (props) {
    const gridToDisplay = props.gridToDisplay
    let toggleCustomButton = props.toggleCustomButton
    const filterBy = props.filterBy
    const enableMultiSelect = props.enableMultiSelect
    const onSelectChangeFunct = props.onSelectChangeFunct
    const filterVals = props.filterVals
    const gridType = props.gridType
    const gridHeight = props.gridConfig ? (props.gridConfig.SIZE ? props.gridConfig.SIZE.HEIGHT : null) : null
    const gridWidth = props.gridConfig ? (props.gridConfig.SIZE ? props.gridConfig.SIZE.WIDTH : null) : null
    let gridTypeCall = 'GET_TABLE_WITH_FILTER'

    let renderGrid
    if (!filterBy && !filterVals) {
      menuConfig('DISABLE_ADD_ROW_FOR_TABLE_FIRST_LEVEL') && menuConfig('DISABLE_ADD_ROW_FOR_TABLE_FIRST_LEVEL').LIST_OF_ITEMS.map((element) => {
        // Disable add button for some grids defined in menuConfig
        if (gridToDisplay === element.TABLE) {
          this.insertNewRow = null
          this.customButton = null
          toggleCustomButton = false
        }
      })
      renderGrid = GridManager.generateGridWithCustomSize(
        gridToDisplay, gridToDisplay,
        gridToDisplay, gridToDisplay, null, null, this.onRowSelect, this.insertNewRow, enableMultiSelect, onSelectChangeFunct, gridHeight, gridWidth, toggleCustomButton, this.customButton
      )
    } else {
      menuConfig('DISABLE_ADD_ROW_FOR_TABLE_FIRST_LEVEL') && menuConfig('DISABLE_ADD_ROW_FOR_TABLE_FIRST_LEVEL').LIST_OF_ITEMS.map((element) => {
        // Disable add button for some grids defined in menuConfig
        if (gridToDisplay === element.TABLE) {
          this.insertNewRow = null
          this.customButton = null
          toggleCustomButton = false
        }
      })
      if (gridType && gridType === 'LIKE') {
        gridTypeCall = 'GET_TABLE_WITH_LIKE_FILTER'
      }
      const gridParams = []
      gridParams.push({
        PARAM_NAME: 'objectName',
        PARAM_VALUE: gridToDisplay
      }, {
        PARAM_NAME: 'gridConfigWeWant',
        PARAM_VALUE: gridToDisplay
      }, {
        PARAM_NAME: 'searchBy',
        PARAM_VALUE: filterBy
      }, {
        PARAM_NAME: 'svSession',
        PARAM_VALUE: store.getState().security.svSession
      }, {
        PARAM_NAME: 'searchForValue',
        PARAM_VALUE: filterVals
      }, {
        PARAM_NAME: 'rowlimit',
        PARAM_VALUE: 10000
      })
      renderGrid = GridManager.generateGridWithCustomSize(
        filterBy + filterVals + gridToDisplay, gridToDisplay, 'CUSTOM_GRID',
        gridTypeCall, gridParams, 'CUSTOM', this.onRowSelect, this.insertNewRow, enableMultiSelect, onSelectChangeFunct, gridHeight, gridWidth, toggleCustomButton, this.customButton
      )
    }
    ComponentManager.setStateForComponent(
      gridToDisplay, null,
      {
        onRowClickFunct: this.onRowSelect,
        addRowSubgrid: this.insertNewRow,
        toggleCustomButton,
        customButton: this.customButton
      }
    )
    this.setState({ renderGrid })
  }

  generateForm (objectId, props, enableExcludedFields) {
    if (this.state.showPopup === false) {
      this.setState({ showPopup: true })
    }
    const formFieldsToBeEcluded = props.formFieldsToBeEcluded
    const params = []
    const formWeWant = props.gridToDisplay
    let formId = `${formWeWant}_FORM`
    if (enableExcludedFields) {
      formId = `${formWeWant}_EXCLUDED_FORM`
    }
    params.push({
      PARAM_NAME: 'formWeWant',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'session',
      PARAM_VALUE: props.svSession
    }, {
      PARAM_NAME: 'table_name',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'parent_id',
      PARAM_VALUE: '0'
    })
    if (objectId) {
      params.push({
        PARAM_NAME: 'object_id',
        PARAM_VALUE: objectId
      })
      formId = `${formWeWant}_FORM_${objectId}`
    } else {
      params.push({
        PARAM_NAME: 'object_id',
        PARAM_VALUE: '0'
      })
    }
    const popUpForm = FormManager.generateForm(
      formId, formId, params, 'formData',
      'GET_FORM_BUILDER', 'GET_UISCHEMA', 'GET_TABLE_FORMDATA', this.closeWindow, null,
      null, null, null, null, undefined, this.onAlertClose, undefined, enableExcludedFields, formFieldsToBeEcluded
    )
    ComponentManager.setStateForComponent(
      formId, null,
      {
        addCloseFunction: this.closeWindow,
        onAlertClose: this.onAlertClose
      }
    )
    this.setState({ popUpForm })
  }

  onRowSelect (gridId, rowIdx, row) {
    if (!this.props.onRowSelectProp) {
      hashHistory.push('/main/data')
    } else if (this.props.onRowSelectProp instanceof Function) {
      if (!this.props.disableDefaultBehaviour) {
        store.dispatch(lastSelectedItem(gridId, row))
      }
      this.props.onRowSelectProp()
    } else {
      console.warn('onRowSelectProp is defined but its not a function')
    }
  }

  closeWindow () {
    this.setState({ popUpForm: undefined, showPopup: false })
  }

  onAlertClose () {
    GridManager.reloadGridData(this.props.gridToDisplay)
    this.setState({ popUpForm: undefined, showPopup: false })
  }

  insertNewRow () {
    this.generateForm(null, this.props, false)
  }

  customButton = () => {
    this.generateForm(null, this.props, true)
  }

  editItemOnRowClick () {
    const grid = this.props.gridToDisplay
    const objectId = store.getState()[grid].rowClicked[`${grid}.OBJECT_ID`]
    this.generateForm(objectId, this.props)
  }

  render () {
    return (
      <div>
        {this.props.gridToDisplay && this.state.renderGrid}
        {this.state.showPopup &&
          <div id='form_modal' className='modal' style={{ display: 'block' }}>
            <Draggable handle='.modal-header'>
              <div id='form_modal_content' className='modal-content'>
                <div className='modal-header'>
                  <button id='modal_close_btn' type='button' className='close' onClick={this.closeWindow} data-dismiss='modal'>&times;</button>
                </div>
                <div id='form_modal_body' className='modal-body'>
                  {this.state.popUpForm}
                </div>
              </div>
            </Draggable>
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  gridLang: state.intl.locale
})

export default connect(mapStateToProps)(MainContent)
