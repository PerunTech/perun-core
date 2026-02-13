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

  const onSubmit = () => {
    const { dispatch } = props
    const formData = ComponentManager.getStateForComponent(`${tableName}_FORM`, 'formTableData');
    dispatch({ type: 'ADD_ADM_CONSOLE_FORM_DATA', payload: { ...formData, recordType: 'TABLE' } })
    alertUserV2({
      type: 'info',
      title: context.intl.formatMessage({ id: 'perun.admin_console.table_change_confirmed', defaultMessage: 'perun.admin_console.table_change_confirmed' }),
    })
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
        customSave
        customSaveButtonName={context.intl.formatMessage({ id: 'perun.admin_console.confirm', defaultMessage: 'perun.admin_console.confirm' })}
        addSaveFunction={onSubmit}
        hideBtns='closeAndDelete'
        className={'admin-settings-forms'}
        inputWrapper={SvarogTableFormWrapper}
        objectId={objectId}
        selectedTableName={selectedTableName}
      />
    )
  }

  const onHide = () => {
    setState({ show: false })
    props.dispatch({ type: 'CLEAN_ADM_CONSOLE_FORM_DATA' })
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
        <Modal className='admin-console-unit-modal' show={show} onHide={onHide}>
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
