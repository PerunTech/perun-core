import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../../client'
import { alertUserResponse, alertUserV2, ReactBootstrap } from '../../../elements'
import SvarogTableFormWrapper from './SvarogTableFormWrapper'
import { TABLE_UISCHEMA_OVERRIDE } from './svarogTableUtils'
import CustomCheckboxWidget from './CustomCheckboxWidget'

const TABLE_ADDITIONAL_WIDGETS = { CustomCheckboxWidget }
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap

const TABLE_NAME = 'SVAROG_TABLES'
const GRID_ID = 'CONFIG_TABLES_GRID'

const ConfigTables = (props, context) => {
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id })

  const initialState = {
    loading: false, show: false, objectId: 0, selectedTableName: '',
    activeTab: 'definition', showRecordModal: false, recordObjectId: 0,
  }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ loading, show, objectId, selectedTableName, activeTab, showRecordModal, recordObjectId }, setState] = useReducer(reducer, initialState)

  useEffect(() => {
    return () => { ComponentManager.cleanComponentReducerState(GRID_ID) }
  }, [])

  const tableFormId = `${TABLE_NAME}_FORM`
  const recordsGridId = selectedTableName ? `${selectedTableName}_RECORDS_GRID` : ''
  const recordFormId = `CONFIG_RECORD_FORM_${selectedTableName}_${recordObjectId}`

  const handleRowClick = (_id, _rowIdx, row) => {
    setState({
      objectId: row[`${TABLE_NAME}.OBJECT_ID`] || 0,
      selectedTableName: row[`${TABLE_NAME}.TABLE_NAME`] || '',
      show: true,
      activeTab: 'definition',
    })
  }

  const doClose = () => {
    setState({ show: false })
    props.dispatch({ type: 'CLEAN_ADM_CONSOLE_FORM_DATA' })
  }

  const onHide = () => {
    if (props.admConsoleFormData.length > 0) {
      alertUserV2({
        type: 'warning',
        title: fmt('perun.admin_console.unsaved_changes_warning'),
        showCancel: true,
        cancelButtonText: fmt('perun.admin_console.cancel'),
        confirmButtonText: fmt('perun.admin_console.discard_and_close'),
        confirmButtonColor: '#dc2626',
        onConfirm: doClose,
      })
      return
    }
    doClose()
  }

  const onTableSubmit = () => {
    const formData = ComponentManager.getStateForComponent(tableFormId, 'formTableData')
    props.dispatch({ type: 'ADD_ADM_CONSOLE_FORM_DATA', payload: { ...formData, recordType: 'TABLE' } })
    alertUserV2({ type: 'info', title: fmt('perun.admin_console.table_change_confirmed') })
  }

  const saveRecord = (e) => {
    const { svSession } = props
    const onConfirm = () => ComponentManager.setStateForComponent(recordFormId, null, { saveExecuted: false })
    const url = `${window.server}/ReactElements/createTableRecordFormData/${svSession}/${selectedTableName}/0`
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
          GridManager.reloadGridData(recordsGridId)
          setState({ showRecordModal: false })
        }
      }
    }).catch(err => {
      console.error(err)
      alertUserResponse({ response: err, onConfirm })
    })
  }

  const deleteRecord = (_id, _action, _session, formData) => {
    const { svSession } = props
    const onConfirm = () => ComponentManager.setStateForComponent(recordFormId, null, { deleteExecuted: false })
    const url = `${window.server}/ReactElements/deleteObject/${svSession}`
    axios({
      method: 'post',
      data: encodeURIComponent(formData[4]['PARAM_VALUE']),
      url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res?.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        alertUserResponse({ type: resType, response: res, onConfirm })
        if (resType === 'success') {
          GridManager.reloadGridData(recordsGridId)
          setState({ showRecordModal: false })
        }
      }
    }).catch(err => {
      console.error(err)
      alertUserResponse({ response: err, onConfirm })
    })
  }

  const handleRecordRowClick = (_id, _rowIdx, row) => {
    setState({ recordObjectId: row[`${selectedTableName}.OBJECT_ID`] || 0, showRecordModal: true })
  }

  const generateTableDefinitionTab = () => {
    const { svSession } = props
    return (
      <GenericForm
        params='READ_URL'
        key={tableFormId}
        id={tableFormId}
        method={`/ReactElements/getTableJSONSchema/${svSession}/${TABLE_NAME}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${TABLE_NAME}`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${objectId}/${TABLE_NAME}`}
        customSave
        customSaveButtonName={fmt('perun.admin_console.confirm_changes')}
        addSaveFunction={onTableSubmit}
        hideBtns='closeAndDelete'
        className='admin-settings-forms'
        uiSchemaOverride={TABLE_UISCHEMA_OVERRIDE}
        additionalWidgets={TABLE_ADDITIONAL_WIDGETS}
        inputWrapper={SvarogTableFormWrapper}
        objectId={objectId}
        selectedTableName={selectedTableName}
        onClose={doClose}
      />
    )
  }

  const generateRecordsTab = () => {
    const { svSession } = props
    return (
      <div className='ct-records-tab'>
        <ExportableGrid
          gridType='READ_URL'
          key={recordsGridId}
          id={recordsGridId}
          configTableName={`/ReactElements/getTableFieldList/${svSession}/${selectedTableName}`}
          dataTableName={`/ReactElements/getTableData/${svSession}/${selectedTableName}/0`}
          onRowClickFunct={handleRecordRowClick}
          refreshData={true}
          toggleCustomButton={true}
          customButton={() => setState({ recordObjectId: 0, showRecordModal: true })}
          customButtonLabel={fmt('perun.admin_console.add')}
          heightRatio={0.6}
          editContextFunc={handleRecordRowClick}
        />
      </div>
    )
  }

  const generateRecordModal = () => {
    const { svSession } = props
    return (
      <Modal className='admin-console-unit-modal' show={showRecordModal} onHide={() => setState({ showRecordModal: false })}>
        <Modal.Header className='admin-console-unit-modal-header' closeButton />
        <Modal.Body className='admin-console-unit-modal-body'>
          <GenericForm
            params='READ_URL'
            key={recordFormId}
            id={recordFormId}
            method={`/ReactElements/getTableJSONSchema/${svSession}/${selectedTableName}`}
            uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${selectedTableName}`}
            tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${recordObjectId}/${selectedTableName}`}
            addSaveFunction={(e) => saveRecord(e)}
            hideBtns={recordObjectId === 0 ? 'closeAndDelete' : 'close'}
            addDeleteFunction={deleteRecord}
            className='admin-settings-forms'
          />
        </Modal.Body>
        <Modal.Footer className='admin-console-unit-modal-footer' />
      </Modal>
    )
  }

  return (
    <>
      {loading && <Loading />}
      <div className='admin-console-grid-container'>
        <div className='admin-console-component-header'>
          <p>{fmt('perun.admin_console.config_tables')}</p>
        </div>
        <ExportableGrid
          gridType='READ_URL'
          key={GRID_ID}
          id={GRID_ID}
          configTableName={`/ReactElements/getTableFieldList/${props.svSession}/${TABLE_NAME}`}
          dataTableName={`/ReactElements/getTableWithMultipleFilters/${props.svSession}/SVAROG_TABLES/IS_CONFIG_TABLE/AND/true/0`}
          onRowClickFunct={handleRowClick}
          refreshData={true}
          toggleCustomButton={true}
          customButton={() => setState({ show: true, objectId: 0, activeTab: 'definition' })}
          customButtonLabel={fmt('perun.admin_console.add')}
          heightRatio={0.75}
          editContextFunc={handleRowClick}
        />
      </div>
      {show && (
        <Modal className='admin-console-unit-modal sf-table-modal' show={show} onHide={onHide}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton />
          <Modal.Body className='admin-console-unit-modal-body'>
            <div className='ct-tabs'>
              <button
                className={`ct-tab${activeTab === 'definition' ? ' ct-tab--active' : ''}`}
                onClick={() => setState({ activeTab: 'definition' })}
              >
                {fmt('perun.admin_console.table_definition')}
              </button>
              {objectId !== 0 && (
                <button
                  className={`ct-tab${activeTab === 'records' ? ' ct-tab--active' : ''}`}
                  onClick={() => setState({ activeTab: 'records' })}
                >
                  {fmt('perun.admin_console.records')}
                </button>
              )}
            </div>
            {activeTab === 'definition' && generateTableDefinitionTab()}
            {activeTab === 'records' && generateRecordsTab()}
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer' />
        </Modal>
      )}
      {showRecordModal && generateRecordModal()}
    </>
  )
}

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
  admConsoleFormData: state.admConsoleFormData,
})

ConfigTables.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ConfigTables)
