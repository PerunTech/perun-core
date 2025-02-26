import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm } from '../../client'
import { ReactBootstrap } from '../../elements'
import SystemConfLogsWrapper from './SystemConfLogsWrapper'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap

const SystemConfLogs = (props, context) => {
  const initialState = { tableName: 'SVAROG_CONFIG_LOG', formTableName: 'SVAROG_NOTES', gridId: 'SVAROG_CONFIG_LOG_GRID', show: false, objectId: 0 }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ tableName, formTableName, gridId, show, objectId }, setState] = useReducer(reducer, initialState)

  useEffect(() => {
    return () => {
      ComponentManager.cleanComponentReducerState(gridId)
    }
  }, [gridId])

  const handleRowClick = (_id, _rowIdx, row) => {
    setState({ objectId: row[`${tableName}.OBJECT_ID`] || 0, show: true })
  }

  const generateConfLogGrid = () => {
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
        heightRatio={0.75}
        editContextFunc={handleRowClick}
      />
    )
  }

  const generateConfLogForm = (objectId) => {
    const { svSession } = props
    return (
      <GenericForm
        params={'READ_URL'}
        key={`${formTableName}_FORM`}
        id={`${formTableName}_FORM`}
        method={`/ReactElements/getTableJSONSchema/${svSession}/${formTableName}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${formTableName}`}
        tableFormDataMethod={`/ReactElements/getFormDataByParentId/${svSession}/${objectId}/${formTableName}`}
        hideBtns='all'
        className={'admin-settings-forms'}
        inputWrapper={SystemConfLogsWrapper}
      />
    )
  }

  return (
    <>
      <div className='admin-console-grid-container'>
        <div className='admin-console-component-header'>
          <p>{context.intl.formatMessage({ id: 'perun.admin_console.svarog_config_log', defaultMessage: 'perun.admin_console.svarog_config_log' })}</p>
        </div>
        {generateConfLogGrid()}
      </div>
      {show && (
        <Modal className='admin-console-unit-modal' show={show} onHide={() => setState({ show: false })}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>
              {context.intl.formatMessage({ id: 'perun.system.logs.preview', defaultMessage: 'perun.system.logs.preview' })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body'>
            {generateConfLogForm(objectId)}
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
        </Modal>
      )}
    </>
  )
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

SystemConfLogs.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(SystemConfLogs)
