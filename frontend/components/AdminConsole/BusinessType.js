import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../client'
import { alertUser, ReactBootstrap } from '../../elements'
const { useState, useEffect } = React
const { Modal } = ReactBootstrap

const BusinessType = (props, context) => {
  const [loading, setLoading] = useState(false)
  const [canRender, setCanRender] = useState(false)
  const [businessObjectTypeName, setBusinessObjectTypeName] = useState(undefined)
  const [gridId, setGridId] = useState(undefined)
  const [show, setShow] = useState(false)
  const [objectId, setObjectId] = useState(undefined)

  useEffect(() => {
    // Get the name of the table
    getBusinessObjectTypeName()
  }, [])

  useEffect(() => {
    return () => {
      ComponentManager.cleanComponentReducerState(gridId)
    }
  }, [gridId])

  const getBusinessObjectTypeName = () => {
    setLoading(true)
    const url = `${window.server}/WsConf/params/get/sys/BUSINESS_OBJECT_TYPE_NAME`
    axios.get(url).then(res => {
      setLoading(false)
      if (res?.data?.VALUE) {
        const objectTypeName = res.data.VALUE
        setBusinessObjectTypeName(objectTypeName)
        setGridId(`${objectTypeName}_GRID`)
        setCanRender(true)
      }
    }).catch(err => {
      setLoading(false)
      console.error(err)
      const title = err.response?.data?.title || err
      const msg = err.response?.data?.message || ''
      alertUser(true, 'error', title, msg)
    })
  }

  const handleRowClick = (_id, _rowIdx, row) => {
    setObjectId(row[`${businessObjectTypeName}.OBJECT_ID`] || 0)
    setShow(true)
  }

  const generateBusinessTypeGrid = () => {
    const { svSession } = props
    return (
      <ExportableGrid
        gridType='READ_URL'
        key={gridId}
        id={gridId}
        configTableName={`/ReactElements/getTableFieldList/${svSession}/${businessObjectTypeName}`}
        dataTableName={`/ReactElements/getTableData/${props.svSession}/${businessObjectTypeName}/0`}
        onRowClickFunct={handleRowClick}
        refreshData={true}
        toggleCustomButton={true}
        customButton={() => {
          setShow(true)
          setObjectId(0)
        }}
        customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
        heightRatio={0.75}
        editContextFunc={handleRowClick}
      />
    )
  }

  const saveRecord = (e) => {
    const { svSession } = props
    const url = `${window.server}/ReactElements/createTableRecordFormData/${svSession}/${businessObjectTypeName}/0`
    axios({
      method: 'post',
      data: encodeURIComponent(JSON.stringify(e.formData)),
      url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.data) {
        const resType = res.data.type.toLowerCase()
        const title = res.data.title || ''
        const msg = res.data.message || ''
        alertUser(true, resType, title, msg)
        GridManager.reloadGridData(gridId)
        setShow(false)
      }
    }).catch(err => {
      console.error(err)
      const title = err.response?.data?.title || err
      const msg = err.response?.data?.message || ''
      alertUser(true, 'error', title, msg, () => ComponentManager.setStateForComponent(`${businessObjectTypeName}_FORM`, null, {
        saveExecuted: false,
      }))
    })
  }

  const generateBusinessTypeForm = (objectId) => {
    const { svSession } = props
    return (
      <GenericForm
        params={'READ_URL'}
        key={`${businessObjectTypeName}_FORM`}
        id={`${businessObjectTypeName}_FORM`}
        method={`/ReactElements/getTableJSONSchema/${svSession}/${businessObjectTypeName}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${businessObjectTypeName}`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${objectId}/${businessObjectTypeName}`}
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
        setShow(false)
        ComponentManager.setStateForComponent(`${businessObjectTypeName}_FORM`, null, {
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
      alertUser(true, 'error', title, msg, () => ComponentManager.setStateForComponent(`${businessObjectTypeName}_FORM`, null, {
        deleteExecuted: false,
      }))
    })
  }

  return (
    <>
      {loading && <Loading />}
      {canRender && (
        <div className='admin-console-grid-container'>
          {generateBusinessTypeGrid()}
        </div>
      )}
      {show && (
        <Modal className='admin-console-unit-modal' show={show} onHide={() => setShow(false)}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>{context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body'>
            {generateBusinessTypeForm(objectId)}
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

BusinessType.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(BusinessType)
