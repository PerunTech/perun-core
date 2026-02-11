import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../../client'
import { alertUserV2, alertUserResponse, ReactBootstrap } from '../../../elements'
import SvarogTableFormWrapper from './SvarogTableFormWrapper'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap

const SvarogTables = (props, context) => {
  const initialState = { tableName: 'SVAROG_TABLES', loading: false, gridId: 'SVAROG_TABLES_GRID', show: false, objectId: 0, selectedTableName: '' }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ tableName, loading, gridId, show, objectId, selectedTableName }, setState] = useReducer(reducer, initialState)

  useEffect(() => {
    return () => {
      ComponentManager.cleanComponentReducerState(gridId)
    }
  }, [gridId])

  const handleRowClick = (_id, _rowIdx, row) => {
    setState({ objectId: row[`${tableName}.OBJECT_ID`] || 0, selectedTableName: row[`${tableName}.TABLE_NAME`] || '', show: true })
  }

  const generateSvarogTablesGrid = () => {
    const { svSession } = props
    return (
      <ExportableGrid
        gridType='READ_URL'
        key={gridId}
        id={gridId}
        configTableName={`/ReactElements/getTableFieldList/${svSession}/${tableName}`}
        dataTableName={`/ReactElements/getTableData/${props.svSession}/${tableName}/0`}
        onRowClickFunct={handleRowClick}
        refreshData={true}
        toggleCustomButton={true}
        customButton={() => {
          setState({ show: true, objectId: 0 })
        }}
        customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
        heightRatio={0.75}
        editContextFunc={handleRowClick}
      />
    )
  }

  const saveRecord = (e) => {
    const { svSession } = props
    const onConfirm = () => ComponentManager.setStateForComponent(`${tableName}_FORM`, null, { saveExecuted: false })
    const formData = ComponentManager.getStateForComponent(`${tableName}_FORM`, 'formTableData')
    const isEmpty = Object.values(formData).every(v => v === null || v === undefined)
    if (!formData || isEmpty) {
      const label = context.intl.formatMessage({ id: 'perun.admin_console.input_data_error', defaultMessage: 'perun.admin_console.input_data_error' })
      alertUserV2({ type: 'info', title: label, onConfirm })
    } else {
      const url = `${window.server}/ReactElements/createTableRecordFormData/${svSession}/${tableName}/0`
      axios({
        method: 'post',
        data: encodeURIComponent(JSON.stringify(e.formData)),
        url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).then((res) => {
        if (res?.data) {
          const resType = res.data?.type?.toLowerCase() || 'info'
          alertUserResponse({ type: resType, response: res, onConfirm })
          if (resType === 'success') {
            GridManager.reloadGridData(gridId)
            ComponentManager.setStateForComponent(gridId, null, { rowClicked: undefined })
            setState({ show: false })
          }
        }
      }).catch(err => {
        console.error(err)
        alertUserResponse({ response: err, onConfirm })
      })
    }
  }

  const generateSvarogTableForm = (objectId) => {
    const { svSession } = props
    return (
      <GenericForm
        params={'READ_URL'}
        key={`${tableName}_FORM`}
        id={`${tableName}_FORM`}
        method={`/ReactElements/getTableJSONSchema/${svSession}/${tableName}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${tableName}`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${objectId}/${tableName}`}
        addSaveFunction={(e) => saveRecord(e)}
        hideBtns={objectId === 0 ? 'closeAndDelete' : 'close'}
        addDeleteFunction={deleteFunc}
        className={'admin-settings-forms'}
        inputWrapper={SvarogTableFormWrapper}
        objectId={objectId}
        selectedTableName={selectedTableName}
      />
    )
  }

  const deleteFunc = (_id, _action, _session, formData) => {
    const { svSession } = props
    const onConfirm = () => ComponentManager.setStateForComponent(`${tableName}_FORM`, null, { deleteExecuted: false })
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
          GridManager.reloadGridData(gridId)
          ComponentManager.setStateForComponent(gridId, null, { rowClicked: undefined })
          setState({ show: false })
        }
      }
    }).catch(err => {
      console.error(err)
      alertUserResponse({ response: err, onConfirm })
    })
  }

  return (
    <>
      {loading && <Loading />}
      <div className='admin-console-grid-container'>
        <div className='admin-console-component-header'>
          <p>{context.intl.formatMessage({ id: 'perun.admin_console.svarog_tables', defaultMessage: 'perun.admin_console.svarog_tables' })}</p>
        </div>
        {generateSvarogTablesGrid()}
      </div>
      {show && (
        <Modal className='admin-console-unit-modal' show={show} onHide={() => setState({ show: false })}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>
              {context.intl.formatMessage({ id: 'perun.admin_console.svarog_table', defaultMessage: 'perun.admin_console.svarog_table' })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body'>
            {generateSvarogTableForm(objectId)}
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
        </Modal>
      )}
    </>
  )
}

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
})

SvarogTables.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(SvarogTables)
