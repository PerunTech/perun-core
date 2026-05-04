import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Loading } from '../../ComponentsIndex'
import { ComponentManager, GenericForm, axios } from '../../../client'
import { ReactBootstrap, Icon, alertUserResponse, alertUserV2 } from '../../../elements'
import { JsonEditor } from '../../JsonEditor'
import SvarogFieldsPanel from './SvarogFieldsPanel'
import SvarogTablePreview from './SvarogTablePreview'
import { normalizeField, formDataToDbDataObject, applyFormDataOverrides, downloadJson, FIELD_UISCHEMA_OVERRIDE } from './svarogTableUtils'
import InvertedMandatoryCheckbox from './InvertedMandatoryCheckbox'

const FIELD_ADDITIONAL_WIDGETS = { InvertedMandatoryCheckbox }
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap

const SvarogTableFormWrapper = (props, context) => {
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id })
  const initialState = {
    loading: false, objectId: undefined,
    tableName: 'SVAROG_FIELDS', selectedFieldObjectId: undefined, selectedTableName: '',
    exportPreview: null, exportServerJson: null, exportFileName: '',
    serverFields: [], fieldsLoading: false,
  }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ loading, objectId, tableName, selectedFieldObjectId, selectedTableName,
    exportPreview, exportServerJson, exportFileName, serverFields, fieldsLoading }, setState] = useReducer(reducer, initialState)

  useEffect(() => {
    getObjectId()
  }, [])

  useEffect(() => {
    if (!objectId || objectId === ' ') return
    setState({ fieldsLoading: true })
    axios.get(`${window.server}/ReactElements/getObjectsByParentId/${props.svSession}/${objectId}/${tableName}/0`)
      .then(res => {
        const raw = Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data) ? res.data : []
        setState({ serverFields: raw.map(normalizeField), fieldsLoading: false })
      })
      .catch(() => setState({ fieldsLoading: false }))
  }, [objectId])

  const getObjectId = () => {
    const { formid } = props
    const objectId = ComponentManager.getStateForComponent(formid, 'objectId')
    const selectedTableName = ComponentManager.getStateForComponent(formid, 'selectedTableName')
    setState({ objectId: objectId || ' ', selectedTableName: selectedTableName || '' })
  }

  const mergedFields = (() => {
    const overrides = props.admConsoleFormData.filter(item => item.recordType === 'FIELD')
    const deletedIds = new Set(overrides.filter(f => f.deleted && f.OBJECT_ID).map(f => f.OBJECT_ID))
    const base = serverFields
      .filter(f => !deletedIds.has(f.OBJECT_ID))
      .map(f => {
        const override = overrides.find(o => o.OBJECT_ID === f.OBJECT_ID && !o.deleted)
        return override ? { ...f, ...override, _pending: true } : f
      })
    const newFields = overrides.filter(f => !f.OBJECT_ID && !f.deleted)
    return [...base, ...newFields.map(f => ({ ...f, _pending: true, _new: true }))]
      .sort((a, b) => (a.SORT_ORDER || 0) - (b.SORT_ORDER || 0))
  })()

  const tableData = ComponentManager.getStateForComponent(props.formid, 'formTableData')
  const tableOverride = props.admConsoleFormData.find(item => item.recordType === 'TABLE')
  const mergedTableData = tableOverride ? { ...(tableData || {}), ...tableOverride } : tableData

  const { userId } = props.userInfo

  const onSaveTable = (draftValues) => {
    props.dispatch({
      type: 'ADD_ADM_CONSOLE_FORM_DATA',
      payload: { ...(tableData || {}), ...draftValues, recordType: 'TABLE' },
    })
    alertUserV2({
      type: 'info',
      title: fmt('perun.admin_console.table_change_confirmed'),
    })
  }

  const exportJson = () => {
    if (!objectId || objectId === ' ') {
      if (props.admConsoleFormData.length === 0) {
        alertUserV2({
          type: 'info',
          title: fmt('perun.admin_console.nothing_to_export'),
        })
      } else {
        const tableFormData = props.admConsoleFormData.find(item => item.recordType === 'TABLE')
        const fieldFormDataEntries = props.admConsoleFormData.filter(item => item.recordType === 'FIELD' && !item.deleted)
        const items = fieldFormDataEntries.map(fd => formDataToDbDataObject(fd, userId))
        if (tableFormData) {
          items.push(formDataToDbDataObject(tableFormData, userId))
        }
        const exportData = {
          'com.prtech.svarog_common.DbDataArray': {
            indexField: null,
            filter: null,
            items,
            idxItems: []
          }
        }
        setState({ exportPreview: exportData, exportServerJson: null, exportFileName: tableFormData?.TABLE_NAME || 'EXPORT_TABLE' })
      }
    } else {
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
        const serverJson = fieldsData[0] ? JSON.parse(JSON.stringify(fieldsData[0])) : null
        const dbDataArray = fieldsData[0]?.['com.prtech.svarog_common.DbDataArray']
        if (dbDataArray && Array.isArray(dbDataArray.items)) {
          const deletedFieldIds = props.admConsoleFormData
            .filter(item => item.recordType === 'FIELD' && item.deleted)
            .map(item => item.OBJECT_ID)
          if (deletedFieldIds.length > 0) {
            dbDataArray.items = dbDataArray.items.filter(item => {
              const dbObj = item['com.prtech.svarog_common.DbDataObject']
              return !dbObj || !deletedFieldIds.includes(dbObj.object_id)
            })
          }
          const fieldOverrides = props.admConsoleFormData.filter(item => item.recordType === 'FIELD')
          applyFormDataOverrides(dbDataArray.items, fieldOverrides)
          const newFields = props.admConsoleFormData.filter(item => item.recordType === 'FIELD' && !item.OBJECT_ID && !item.deleted)
          if (newFields.length > 0) {
            dbDataArray.items.push(...newFields.map(fd => formDataToDbDataObject(fd, userId)))
          }
          if (tableData) {
            const tableItem = Array.isArray(tableData) ? tableData : [tableData]
            const serverDbDataArray = serverJson?.['com.prtech.svarog_common.DbDataArray']
            if (serverDbDataArray) {
              serverDbDataArray.items.push(...JSON.parse(JSON.stringify(tableItem)))
            }
            const tableOverrides = props.admConsoleFormData.filter(item => item.recordType === 'TABLE')
            applyFormDataOverrides(tableItem, tableOverrides)
            dbDataArray.items.push(...tableItem)
          }
        }
        const exportData = fieldsData[0] || {}
        const hasOverrides = props.admConsoleFormData.length > 0
        setState({
          exportPreview: exportData,
          exportServerJson: hasOverrides ? serverJson : null,
          exportFileName: selectedTableName
        })
      }).catch(err => {
        console.error(err)
        setState({ loading: false })
        alertUserResponse({ response: err })
      })
    }
  }

  const handleExportSave = (json) => {
    downloadJson(json, exportFileName)
    setState({ exportPreview: null, exportServerJson: null, exportFileName: '' })
  }

  const fieldFormId = `SVAROG_FIELDS_FORM_${selectedFieldObjectId}`

  const onDelete = () => {
    const { dispatch } = props
    const formData = ComponentManager.getStateForComponent(fieldFormId, 'formTableData')
    dispatch({ type: 'ADD_ADM_CONSOLE_FORM_DATA', payload: { ...formData, recordType: 'FIELD', deleted: true } })
    alertUserV2({
      type: 'info',
      title: fmt('perun.admin_console.field_deleted'),
    })
    setState({ selectedFieldObjectId: undefined })
  }

  const onSubmit = () => {
    const { dispatch } = props
    const formData = ComponentManager.getStateForComponent(fieldFormId, 'formTableData')
    dispatch({ type: 'ADD_ADM_CONSOLE_FORM_DATA', payload: { ...formData, recordType: 'FIELD' } })
    alertUserV2({
      type: 'info',
      title: fmt('perun.admin_console.field_change_confirmed'),
    })
  }

  const generateFieldForm = () => {
    const { svSession } = props
    const buttonsArray = [{
      type: 'button',
      id: 'delete_table_field',
      className: 'btn-danger btn_delete_form delete-svarog-field-btn',
      action: onDelete,
      label: fmt('perun.admin_console.delete_field'),
    }]
    return (
      <GenericForm
        params={'READ_URL'}
        key={fieldFormId}
        id={fieldFormId}
        method={`/ReactElements/getTableJSONSchema/${svSession}/${tableName}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${tableName}`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${selectedFieldObjectId}/${tableName}`}
        customSave
        customSaveButtonName={fmt('perun.admin_console.confirm_changes')}
        addSaveFunction={onSubmit}
        hideBtns='closeAndDelete'
        buttonsArray={selectedFieldObjectId !== 0 ? buttonsArray : []}
        className={'admin-settings-forms'}
        additionalWidgets={FIELD_ADDITIONAL_WIDGETS}
        uiSchemaOverride={FIELD_UISCHEMA_OVERRIDE}
      />
    )
  }

  return (
    <>
      {loading && <Loading />}
      <div className='perun-menu-buttons-container'>
        <button className='btn-success btn_save_form svarog-table-export-btn' onClick={exportJson}>
          {fmt('perun.admin_console.export_table_and_fields')}
          <span className='download-span'>{<Icon name='IconDatabaseExport' />}</span>
        </button>
      </div>
      <SvarogTablePreview data={mergedTableData} onSave={onSaveTable} />
      {objectId && (
        <div className='sf-split-panel'>
          <div className='sf-entity-box'>
            <div className='sf-entity-box-header'>
              <span>{fmt('perun.admin_console.svarog_fields')}</span>
              <span className='sf-field-count'>{mergedFields.length}</span>
            </div>
            {fieldsLoading
              ? <Loading />
              : (
                <SvarogFieldsPanel
                  fields={mergedFields}
                  selectedObjectId={selectedFieldObjectId}
                  onSelect={(oid) => setState({ selectedFieldObjectId: oid })}
                  onAdd={() => setState({ selectedFieldObjectId: 0 })}
                  addLabel={fmt('perun.admin_console.add')}
                />
              )
            }
          </div>
          <div className='sf-form-panel'>
            {selectedFieldObjectId !== undefined
              ? (
                <>
                  <div className='sf-form-panel-toolbar'>
                    <button
                      className='sf-form-close-btn'
                      title={fmt('perun.main.forms.close')}
                      onClick={() => setState({ selectedFieldObjectId: undefined })}
                    >
                      <Icon name='IconX' size={16} />
                    </button>
                  </div>
                  {generateFieldForm()}
                </>
              )
              : (
                <div className='sf-no-selection'>
                  {fmt('perun.admin_console.select_field_to_edit')}
                </div>
              )
            }
          </div>
        </div>
      )}
      {exportPreview && (
        <Modal
          className='admin-console-unit-modal menu-editor-modal'
          show={!!exportPreview}
          onHide={() => setState({ exportPreview: null, exportServerJson: null, exportFileName: '' })}
        >
          <Modal.Header className='admin-console-unit-modal-header menu-editor-header' closeButton>
            <Modal.Title>{exportFileName}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body menu-editor-body'>
            <JsonEditor
              value={exportPreview}
              originalValue={exportServerJson}
              onDownload={handleExportSave}
            />
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer menu-editor-footer'></Modal.Footer>
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
  userInfo: state.userInfo,
})

export default connect(mapStateToProps)(SvarogTableFormWrapper)
