import React from 'react'
import { svConfig } from '../../config';
import { GridManager, ComponentManager, ExportableGrid } from '../../elements';
import { store, editRecordInline } from '../../model';


class DocManSearchByParamGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      generateGrid: null
    }
    this.onRowClick = this.onRowClick.bind(this)
    this.onEnter = this.onEnter.bind(this)
    this.gridWithCustomFn = this.gridWithCustomFn.bind(this)
  }

  componentDidMount() {
    //  debugger;
    this.gridWithCustomFn()
  }

  /* on row click fn params to onRowClick in docManHolder */
  onRowClick(documentManagerGrid, rowId, row) {
    const statusValue = row['SVAROG_FORM_TYPE.STATUS']
    const objId = row['SVAROG_FORM_TYPE.OBJECT_ID']
    const objType = row['SVAROG_FORM_TYPE.OBJECT_TYPE']
    const labelCode = row['SVAROG_FORM_TYPE.LABEL_CODE']
    this.props.onRowClick(statusValue, objId, objType, labelCode)
  }

  /* onEnterClick fn saves changes in the selected cell in the grid */
  onEnter(that, rows, rowIdx, updated) {
    const onSave = svConfig.triglavRestVerbs.SAVE_FORM_DATA_2 + store.getState().security.svSession + '/SVAROG_FORM_TYPE/0/null'
    let newObject = rows[rowIdx]
    Object.assign(newObject, updated)
    store.dispatch(editRecordInline(that.props.session, onSave, newObject, that.state.id))
  }

  /* generate custom grid with the needed params and fn */
  gridWithCustomFn() {
    let documentManagerGridId = 'SVAROG_FORM_TYPE'
    let documentManagerGrid = <ExportableGrid
      id={documentManagerGridId + this.props.filterName + this.props.filterValue + this.props.objId}
      key={documentManagerGridId + this.props.filterName + this.props.filterValue + this.props.objId}
      configTableName='CUSTOM_GRID'
      dataTableName='GET_SEARCH_RESULTS'
      params={[
        {
          PARAM_NAME: 'session',
          PARAM_VALUE: store.getState().security.svSession
        }, {
          PARAM_NAME: 'gridName',
          PARAM_VALUE: 'SVAROG_FORM_TYPE'
        }, {
          PARAM_NAME: 'gridConfigWeWant',
          PARAM_VALUE: documentManagerGridId
        }, {
          PARAM_NAME: 'rowlimit',
          PARAM_VALUE: '1000'
        }, {
          PARAM_NAME: 'filterName',
          PARAM_VALUE: this.props.filterName
        }, {
          PARAM_NAME: 'filterValue',
          PARAM_VALUE: this.props.filterValue
        }
      ]}
      gridType='CUSTOM'
      onRowClickFunct={this.onRowClick}
      handleRowUpdatedFunct={this.onEnter}
      enableMultiSelect={true}
      showCheckbox={true}
      onRowDoubleClick={true}
    />
    ComponentManager.setStateForComponent(documentManagerGridId + this.props.filterName + this.props.filterValue + this.props.objId, null)
    GridManager.reloadGridData(documentManagerGridId + this.props.filterName + this.props.filterValue + this.props.objId)
    this.setState(
      { generateGrid: documentManagerGrid }
    )
  }

  render() {
    const { generateGrid } = this.state
    return (
      <div>{generateGrid}</div>
    )
  }
}

export default DocManSearchByParamGrid
