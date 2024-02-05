import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translateComponents } from '../../../../config/config';
import { menuConfig } from '../../../../config/menuConfig';
import { store, lastSelectedItem } from '../../../../model';
import { ComponentManager, FormManager, GridManager } from '../../..';

class MultiGrid extends React.Component {
  static propTypes = {
    showGrid: PropTypes.string.isRequired,
    parentId: PropTypes.number.isRequired,
    linkName: PropTypes.string,
    // isContainer: PropTypes.bool
  }
  constructor(props) {
    super(props)
    this.state = {
      showPopup: false,
      popUpForm: undefined,
      renderGrid: [],
      switchBtnName: 'Show Dead'
    }
    this.generateGrid = this.generateGrid.bind(this)
    this.generateForm = this.generateForm.bind(this)
    this.insertNewRow = this.insertNewRow.bind(this)
    this.editItemOnRowClick = this.editItemOnRowClick.bind(this)
    this.generateObjectsForParent = this.generateObjectsForParent.bind(this)
    this.closeWindow = this.closeWindow.bind(this)
    this.onAlertClose = this.onAlertClose.bind(this)
  }

  componentDidMount() {
    if (this.props.showGrid) {
      this.generateGrid(this.props, 'STATUS', 'VALID', '1')
      this.generateGrid(this.props, 'STATUS', 'RETIRED', '2')
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.showGrid !== this.props.showGrid ||
      nextProps.parentId !== this.props.parentId ||
      nextProps.linkName !== this.props.linkName ||
      nextProps.toggleCustomButton !== this.props.toggleCustomButton) {
      this.generateGrid(nextProps, 'STATUS', 'VALID', '1')
      this.generateGrid(nextProps, 'STATUS', 'RETIRED', '2')
    }
    // re-render if labels change
    if (nextProps.gridLang && (this.props.gridLang !== nextProps.gridLang)) {
      !translateComponents && this.forceUpdate()
      translateComponents && GridManager.reloadGridData(`${this.props.showGrid}_${this.props.parentId}`)
    }
  }

  generateGrid(props, filterByCol, filterValue, position) {
    if (props) {
      const {
        showGrid, parentId, linkName, isContainer, gridConfig, linkedTable
      } = props
      let toggleCustomButton = this.props.toggleCustomButton
      let insertNewRow = () => this.insertNewRow(gridId)
      let gridId = `${showGrid}_${parentId}${position}`
      let enableMultiSelect = this.props.enableMultiSelect
      let onSelectChangeFunct = this.props.onSelectChangeFunct
      let methodType = 'GET_TABLE_WITH_FILTER'
      let onRowClick = this.editItemOnRowClick
      let gridHeight = gridConfig ? (gridConfig.SIZE ? gridConfig.SIZE.HEIGHT : null) : null
      let gridWidth = gridConfig ? (gridConfig.SIZE ? gridConfig.SIZE.WIDTH : null) : null
      const params = []

      let customButton = this.customButton // props.gridInModal ? this.generateGridInModal(props, gridId) : this.customButton(gridId)
      let hasLinkGridInModal
      menuConfig('SHOW_GRIDMODAL_TO_LINK_TO_TABLE') && menuConfig('SHOW_GRIDMODAL_TO_LINK_TO_TABLE').map((element) => {
        if (linkedTable === element.TABLE && (showGrid === element.LINKEDTABLE) && element.LINKS) {
          customButton = () => this.generateGridInModal(props, gridId)
          hasLinkGridInModal = true
        }
      })
      menuConfig('DISABLE_ADD_ROW_FOR_TABLE_SECOND_LEVEL') && menuConfig('DISABLE_ADD_ROW_FOR_TABLE_SECOND_LEVEL').LIST_OF_ITEMS.map((element) => {
        // Disable add button for some grids defined in menuConfig
        if (showGrid === element.TABLE) {
          insertNewRow = null
          this.customButton = null
          toggleCustomButton = false
        }
      })
      if (filterValue === 'RETIRED') {
        insertNewRow = null
        this.customButton = null
        toggleCustomButton = false
        enableMultiSelect = false
        onSelectChangeFunct = null
      }
      params.push({
        PARAM_NAME: 'gridConfigWeWant',
        PARAM_VALUE: showGrid
      }, {
        PARAM_NAME: 'session',
        PARAM_VALUE: props.svSession
      }, {
        PARAM_NAME: 'parentColumn',
        PARAM_VALUE: 'PARENT_ID'
      }, {
        PARAM_NAME: 'parentId',
        PARAM_VALUE: parentId
      }, {
        PARAM_NAME: 'objectName',
        PARAM_VALUE: showGrid
      }, {
        PARAM_NAME: 'rowlimit',
        PARAM_VALUE: 1000
      }, {
        PARAM_NAME: 'searchBy',
        PARAM_VALUE: filterByCol
      }, {
        PARAM_NAME: 'searchForValue',
        PARAM_VALUE: filterValue
      }, {
        PARAM_NAME: 'criterumConjuction',
        PARAM_VALUE: 'AND'
      })
      if (linkName) {
        methodType = 'GET_BYLINK'
        params.push({
          PARAM_NAME: 'linkName',
          PARAM_VALUE: linkName
        })
        gridId = `${showGrid}_${parentId}_${linkName}`
      }
      if (isContainer) {
        onRowClick = this.generateObjectsForParent
      }
      // gridWidth = (window.innerWidth * 35) / 100
      gridHeight = (window.innerWidth * 20) / 100
      const renderGrid = GridManager.generateGridWithCustomSize(
        gridId, gridId, 'CUSTOM_GRID',
        methodType, params, 'CUSTOM', onRowClick, insertNewRow,
        enableMultiSelect, onSelectChangeFunct, gridHeight, gridWidth,
        toggleCustomButton, customButton, hasLinkGridInModal
      )
      ComponentManager.setStateForComponent(
        gridId, null,
        {
          onRowClickFunct: onRowClick,
          addRowSubgrid: insertNewRow,
          toggleCustomButton,
          customButton: customButton,
          hasLinkGridInModal,
          minWidth: gridWidth,
          minHeight: gridHeight
        }
      )
      GridManager.reloadGridData(`${this.props.showGrid}_${this.props.parentId}${position}`)
      let grids = this.state.renderGrid
      grids.push(renderGrid)
      this.setState({ renderGrid: grids })
    }
  }

  insertNewRow(gridId) {
    this.generateForm(null, gridId, this.props, false)
  }

  customButton = (gridId) => {
    this.generateForm(null, gridId, this.props, true)
  }

  generateGridInModal = (props, gridId) => {
    const linkData = {
      linkName: props.linkName,
      linkedTable: props.linkedTable,
      objectId1: props.parentId,
      gridId: gridId
    }
    this.setState(
      { gridInModal: '' },
      () => this.setState({ gridInModal: <this.props.gridInModal {...linkData} /> })
    )
  }

  generateObjectsForParent(gridId, rowIdx, row) {
    /* let subGridId
    if (gridId.indexOf('_VALID') > -1) {
      subGridId = gridId.replace(/_VALID/g, '')
    } else if (gridId.indexOf('_RETIRED') > -1) {
      subGridId = gridId.replace(/_RETIRED/g, '')
    } */
    store.dispatch(lastSelectedItem(gridId, row))
  }

  editItemOnRowClick(gridId, rowIdx, row) {
    const objectId = row[`${this.props.showGrid}.OBJECT_ID`]
    this.generateForm(objectId, gridId, this.props)
  }

  generateForm(objectId, gridId, props, enableExcludedFields) {
    if (this.state.showPopup === false) {
      this.setState({ showPopup: true })
    }
    const formFieldsToBeEcluded = props.formFieldsToBeEcluded
    const params = []
    let formWeWant = props.showGrid
    let formId = `${formWeWant}_FORM_${props.parentId}`
    if (enableExcludedFields) {
      formId = `${formWeWant}_EXCLUDED_FORM_${props.parentId}`
    }
    if (props.linkName) {
      params.push({
        'PARAM_NAME': 'link_name',
        'PARAM_VALUE': props.linkName
      }, {
        'PARAM_NAME': 'link_note',
        'PARAM_VALUE': props.linkNote
      }, {
        'PARAM_NAME': 'table_name_to_link',
        'PARAM_VALUE': props.linkedTable
      }, {
        'PARAM_NAME': 'object_id_to_link',
        'PARAM_VALUE': props.parentId
      }, {
        'PARAM_NAME': 'parent_id',
        'PARAM_VALUE': '0'
      })
    } else {
      params.push({
        'PARAM_NAME': 'parent_id',
        'PARAM_VALUE': props.parentId
      })
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
      PARAM_NAME: 'object_id',
      PARAM_VALUE: objectId || '0'
    })
    if (objectId) {
      formId = `${formWeWant}_FORM_${objectId}`
    }
    const popUpForm = FormManager.generateForm(
      formId, formId, params, 'formData',
      'GET_FORM_BUILDER', 'GET_UISCHEMA', 'GET_TABLE_FORMDATA', this.closeWindow, null,
      null, null, null, null, undefined, () => this.onAlertClose(gridId), undefined, enableExcludedFields, formFieldsToBeEcluded
    )
    ComponentManager.setStateForComponent(formId, null, {
      addCloseFunction: this.closeWindow,
      onAlertClose: () => this.onAlertClose(gridId)
    })
    this.setState({ popUpForm })
  }

  closeWindow() {
    this.setState({ popUpForm: undefined, showPopup: false })
  }

  onAlertClose(gridId) {
    this.setState({ popUpForm: undefined, showPopup: false })
    GridManager.reloadGridData(gridId)
  }

  switchGrid(props) {
    this.generateGrid(props)
    if (this.state.switchBtnName === 'Show Dead') {
      this.setState({ switchBtnName: 'Show Alive' })
    } else {
      this.setState({ switchBtnName: 'Show Dead' })
    }
  }

  render() {
    // const switchable = <button id='switchGrid' className='switch-grid-btn'
    //   onClick={() => this.switchGrid(this.props)}>
    //   {this.state.switchBtnName}
    // </button>

    // const vertical = <div style={{'float': 'left'}}>
    //   {this.props.showGrid && this.props.parentId ? this.state.renderGrid : null}
    // </div>
    // <div style={{'float': 'left'}}>
    //   {this.props.showGrid && this.props.parentId ? this.state.renderGrid : null}
    // </div>
    const grids = this.state.renderGrid.map((element, index) => <li key={index}>{element}</li>)
    return (
      <div>
        <ul id='grids' style={{ 'listStyleType': 'none', 'padding': '0' }}>
          {grids}
        </ul>
        {this.state.showPopup &&
          <div id='form_modal' className='modal' style={{ display: 'block' }}>
            <div id='form_modal_content' className='modal-content'>
              <div className='modal-header'>
                <button id='modal_close_btn' type='button' className='close' onClick={this.closeWindow} data-dismiss='modal'>&times;</button>
              </div>
              <div id='form_modal_body' className='modal-body'>
                {this.state.popUpForm}
              </div>
            </div>
          </div>
        }
        {this.state.gridInModal}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
  gridLang: state.intl.locale
})
export default connect(mapStateToProps)(MultiGrid)
