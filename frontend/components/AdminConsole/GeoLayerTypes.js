import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../client'
import { alertUser, ReactBootstrap } from '../../elements'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap

const GeoLayerTypes = (props, context) => {
  const initialState = { tableName: 'GEO_LAYER_TYPE', loading: false, gridId: undefined, show: false, objectId: 0 }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ tableName, loading, gridId, show, objectId }, setState] = useReducer(reducer, initialState)

  useEffect(() => {
    return () => {
      ComponentManager.cleanComponentReducerState(gridId)
    }
  }, [gridId])

  const handleRowClick = (_id, _rowIdx, row) => {
    setState({ objectId: row[`${tableName}.OBJECT_ID`] || 0, show: true })
  }

  const generateGeoLayerTypeGrid = () => {
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
      alertUser(true, 'info', label, '', onConfirm)
    } else {
      const url = `${window.server}/ReactElements/createTableRecordFormData/${svSession}/${tableName}/0`
      axios({
        method: 'post',
        data: encodeURIComponent(JSON.stringify(e.formData)),
        url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).then((res) => {
        if (res.data) {
          alertUserResponse(res.data)
          GridManager.reloadGridData(gridId)
          setState({ show: false })
        }
      }).catch(err => {
        console.error(err)
        const title = err.response?.data?.title || err
        const msg = err.response?.data?.message || ''
        alertUser(true, 'error', title, msg, onConfirm)
      })
    }
  }

  const generateGeoLayerTypeForm = (objectId) => {
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
      />
    )
  }

  const deleteFunc = (_id, _action, _session, formData) => {
    const { svSession } = props
    const url = `${window.server}/ReactElements/deleteObject/${svSession}`
    axios({
      method: 'post',
      data: encodeURIComponent(formData[4]['PARAM_VALUE']),
      url: url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.data.type === 'SUCCESS') {
        alertUser(true, 'success', res.data.title, res.data.message)
        setState({ show: false })
        ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
          deleteExecuted: false,
        })
        ComponentManager.setStateForComponent(gridId, null, {
          rowClicked: undefined,
        })
        GridManager.reloadGridData(gridId)
      }
    }).catch(err => {
      console.error(err)
      const title = err.response?.data?.title || err
      const msg = err.response?.data?.message || ''
      alertUser(true, 'error', title, msg, () => ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
        deleteExecuted: false,
      }))
    })
  }

  return (
    <>
      {loading && <Loading />}
      <div className='admin-console-grid-container'>
        {generateGeoLayerTypeGrid()}
      </div>
      {show && (
        <Modal className='admin-console-unit-modal' show={show} onHide={() => setState({ show: false })}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>
              {context.intl.formatMessage({ id: 'perun.admin_console.geo_layer_type', defaultMessage: 'perun.admin_console.geo_layer_type' })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body'>
            {generateGeoLayerTypeForm(objectId)}
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

GeoLayerTypes.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(GeoLayerTypes)
