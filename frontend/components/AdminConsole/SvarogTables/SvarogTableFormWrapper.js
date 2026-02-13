import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Loading } from '../../ComponentsIndex'
import { ComponentManager, ExportableGrid, GenericForm, GridManager, axios } from '../../../client'
import { ReactBootstrap, Icon, alertUserResponse, alertUserV2 } from '../../../elements'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap

const SvarogTableFormWrapper = (props, context) => {
  const initialState = {
    loading: false, objectId: undefined, show: false, parentTableName: 'SVAROG_TABLES',
    tableName: 'SVAROG_FIELDS', gridId: 'SVAROG_FIELDS_GRID', selectedFieldObjectId: undefined, selectedTableName: ''
  }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ loading, objectId, show, tableName, gridId, selectedFieldObjectId, selectedTableName }, setState] = useReducer(reducer, initialState)

  useEffect(() => {
    getObjectId()
  }, [])

  useEffect(() => {
    return () => {
      ComponentManager.cleanComponentReducerState(gridId)
    }
  }, [gridId])

  const reloadGrid = () => {
    GridManager.reloadGridData(gridId)
    ComponentManager.setStateForComponent(gridId, 'rowClicked', undefined)
  }

  const getObjectId = () => {
    const { formid } = props
    const objectId = ComponentManager.getStateForComponent(formid, 'objectId');
    const selectedTableName = ComponentManager.getStateForComponent(formid, 'selectedTableName');
    if (objectId) {
      setState({ objectId, selectedTableName: selectedTableName || '' })
    }
  }

  const metaKeys = ['OBJECT_ID', 'OBJECT_TYPE', 'PKID', 'PARENT_ID', 'recordType']

  const formDataToValues = (formData) => {
    return Object.entries(formData)
      .filter(([key]) => !metaKeys.includes(key))
      .map(([key, value]) => ({ [key]: value }))
  }

  const applyFormDataOverrides = (items, recordType) => {
    const overrides = props.admConsoleFormData.filter(item => item.recordType === recordType)
    if (overrides.length === 0) return
    for (const item of items) {
      const dbDataObject = item['com.prtech.svarog_common.DbDataObject']
      if (!dbDataObject) continue
      const override = overrides.find(o => o.OBJECT_ID === dbDataObject.object_id)
      if (override) {
        dbDataObject.values = formDataToValues(override)
      }
    }
  }

  const exportJson = () => {
    setState({ loading: true })
    const { svSession } = props
    const fieldsUrl = `${window.server}/WsCore/children/${svSession}/${objectId}/SVAROG_FIELDS`
    const tableUrl = `${window.server}/WsCore/object/${svSession}/${objectId}/SVAROG_TABLES`

    Promise.all([
      axios.get(fieldsUrl),
      axios.get(tableUrl)
    ]).then(([fieldsRes, tableRes]) => {
      setState({ loading: false })
      const fieldsData = Array.isArray(fieldsRes?.data) ? fieldsRes.data : fieldsRes?.data ? [fieldsRes.data] : []
      const tableData = tableRes?.data
      const dbDataArray = fieldsData[0]?.['com.prtech.svarog_common.DbDataArray']
      if (dbDataArray && Array.isArray(dbDataArray.items)) {
        applyFormDataOverrides(dbDataArray.items, 'FIELD')
        if (tableData) {
          const tableItem = Array.isArray(tableData) ? tableData : [tableData]
          applyFormDataOverrides(tableItem, 'TABLE')
          dbDataArray.items.push(...tableItem)
        }
      }
      const exportData = fieldsData[0] || {}
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedTableName}.json`
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }).catch(err => {
      console.error(err)
      setState({ loading: false })
      alertUserResponse({ response: err })
    })
  }

  const handleRowClick = (_id, _rowIdx, row) => {
    setState({ selectedFieldObjectId: row[`${tableName}.OBJECT_ID`] || 0, show: true })
  }

  const generateFieldsGrid = () => {
    const { svSession } = props
    return (
      <ExportableGrid
        gridType='READ_URL'
        key={gridId}
        id={gridId}
        configTableName={`/ReactElements/getTableFieldList/${svSession}/${tableName}`}
        dataTableName={`/ReactElements/getObjectsByParentId/${svSession}/${objectId}/${tableName}/0`}
        onRowClickFunct={handleRowClick}
        refreshData={true}
        toggleCustomButton={true}
        customButton={() => {
          setState({ show: true, selectedFieldObjectId: 0 })
        }}
        customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
        heightRatio={0.75}
        editContextFunc={handleRowClick}
      />
    )
  }

  const deleteFunc = (_id, _action, _session, formData) => {
    const { svSession } = props
    const onConfirm = () => ComponentManager.setStateForComponent(`SVAROG_FIELDS_FORM`, null, { deleteExecuted: false })
    const url = `${window.server}/ReactElements/deleteObject/${svSession}`
    axios({
      method: 'post',
      data: encodeURIComponent(formData[4]['PARAM_VALUE']),
      url: url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res?.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        alertUserResponse({ type: resType, response: res, onConfirm })
        if (resType === 'success') {
          reloadGrid()
          setState({ show: false })
        }
      }
    }).catch(err => {
      console.error(err)
      alertUserResponse({ response: err, onConfirm })
    })
  }

  const onSubmit = () => {
    const { dispatch } = props
    const formData = ComponentManager.getStateForComponent(`${tableName}_FORM`, 'formTableData');
    dispatch({ type: 'ADD_ADM_CONSOLE_FORM_DATA', payload: { ...formData, recordType: 'FIELD' } })
    alertUserV2({
      type: 'info',
      title: context.intl.formatMessage({ id: 'perun.admin_console.field_change_confirmed', defaultMessage: 'perun.admin_console.field_change_confirmed' }),
    })
    setState({ show: false })
  }

  const generateFieldForm = () => {
    const { svSession } = props
    return (
      <GenericForm
        params={'READ_URL'}
        key={`SVAROG_FIELDS_FORM`}
        id={`SVAROG_FIELDS_FORM`}
        method={`/ReactElements/getTableJSONSchema/${svSession}/${tableName}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${tableName}`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${selectedFieldObjectId}/${tableName}`}
        customSave
        customSaveButtonName={context.intl.formatMessage({ id: 'perun.admin_console.confirm', defaultMessage: 'perun.admin_console.confirm' })}
        addSaveFunction={onSubmit}
        hideBtns={selectedFieldObjectId === 0 ? 'closeAndDelete' : 'close'}
        addDeleteFunction={deleteFunc}
        className={'admin-settings-forms'}
      />
    )
  }

  return (
    <>
      {loading && <Loading />}
      {objectId && (
        <div className='perun-menu-buttons-container'>
          <button className='btn-success btn_save_form svarog-table-export-btn' onClick={exportJson}>
            {context.intl.formatMessage({ id: 'perun.admin_console.export_table_and_fields', defaultMessage: 'perun.admin_console.export_table_and_fields' })}
            <span className='download-span'>{<Icon name='IconDatabaseExport' />}</span>
          </button>
        </div>
      )}
      {props.children}
      {objectId && (
        <div className='admin-console-grid-container'>
          <div className='admin-console-component-header'>
            <p>{context.intl.formatMessage({ id: 'perun.admin_console.svarog_fields', defaultMessage: 'perun.admin_console.svarog_fields' })}</p>
          </div>
          {generateFieldsGrid()}
        </div>
      )}
      {show && (
        <Modal className='admin-console-unit-modal' show={show} onHide={() => setState({ show: false })}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>{context.intl.formatMessage({ id: 'perun.admin_console.svarog_field', defaultMessage: 'perun.admin_console.svarog_field' })}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body'>
            {generateFieldForm()}
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
        </Modal>
      )}
    </>
  )
}

SvarogTableFormWrapper.contextTypes = {
  intl: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
  admConsoleFormData: state.admConsoleFormData,
})

export default connect(mapStateToProps)(SvarogTableFormWrapper)
