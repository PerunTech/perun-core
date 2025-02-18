import React from 'react'
import { ComponentManager, ExportableGrid, GridManager, PropTypes, axios } from '../../client'
import { connect } from 'react-redux'
import Modal from '../Modal/Modal'
import GenericForm from '../../elements/form/GenericForm'
import { alertUser } from '../../elements'

const tableName = 'SVAROG_SYS_PARAMS'
const formId = tableName + '_FORM'
const gridId = tableName + '_GRID'

class SvarogSystemParams extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      grid: undefined,
      svarogSysParamsFormModal: undefined,
    }
  }

  componentDidMount() {
    this.getInitGrid()
  }

  componentWillUnmount() {
    this.setState({ grid: undefined })
    ComponentManager.cleanComponentReducerState(gridId)
  }

  getInitGrid = () => {
    const { session } = this.props
    const grid = (
      <ExportableGrid
        gridType={'READ_URL'}
        key={gridId}
        id={gridId}
        configTableName={`/ReactElements/getTableFieldList/${session}/${tableName}`}
        dataTableName={`/ReactElements/getTableData/${session}/${tableName}/0`}
        onRowClickFunct={this.onRowClick}
        toggleCustomButton
        customButton={this.showModal}
        refreshData={true}
        heightRatio={0.75}
        customButtonLabel={this.context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
      />
    )

    ComponentManager.setStateForComponent(gridId, null, { onRowClickFunct: this.onRowClick, customButton: this.showModal })
    this.setState({ grid })
  }

  onRowClick = (_gridId, _rowId, row) => {
    const selectedObjId = row[`${tableName}.OBJECT_ID`]
    this.showModal(selectedObjId)
  }

  saveSvarogSysParam = (formData, url) => {
    axios({ method: 'post', data: encodeURIComponent(JSON.stringify(formData)), url, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(res => {
      if (res.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        const title = res.data?.title || ''
        const msg = res.data?.message || ''
        alertUser(true, resType, title, msg, () => ComponentManager.setStateForComponent(formId, null, { saveExecuted: false }))
        if (resType === 'success') {
          this.closeModal()
          GridManager.reloadGridData(gridId)
        }
      }
    }).catch(err => {
      console.error(err)
      alertUser(true, 'error', err, '', () => ComponentManager.setStateForComponent(formId, null, { saveExecuted: false }))
    })
  }

  deleteSvarogSysParam = (_id, _method, _session, params) => {
    const { session } = this.props
    const formData = params[4].PARAM_VALUE
    const data = encodeURIComponent(JSON.stringify(JSON.parse(formData)))
    const url = `${window.server}/ReactElements/deleteObject/${session}`
    axios({ method: 'post', data, url, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(res => {
      if (res.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        const title = res.data?.title || ''
        const msg = res.data?.message || ''
        alertUser(true, resType, title, msg, () => ComponentManager.setStateForComponent(formId, null, { saveExecuted: false }))
        if (resType === 'success') {
          this.closeModal()
          GridManager.reloadGridData(gridId)
        }
      }
    }).catch(err => {
      const title = err.response?.data?.title || err
      const msg = err.response?.data?.message || ''
      alertUser(true, 'error', title, msg, () => ComponentManager.setStateForComponent(formId, null, { saveExecuted: false }))
    })
  }

  showModal = (objectId) => {
    const { session } = this.props
    const svarogSysParamObjId = objectId || 0
    const modalTitle = objectId ? this.context.intl.formatMessage({ id: 'perun.admin_console.svarog_system_params', defaultMessage: 'perun.admin_console.svarog_system_params' })
      : this.context.intl.formatMessage({ id: 'perun.admin_console.add_svarog_system_params', defaultMessage: 'perun.admin_console.add_svarog_system_params' })
    const hideBtns = objectId ? 'close' : 'closeAndDelete'
    const addDeleteFunction = objectId ? this.deleteSvarogSysParam : null

    const addSaveFunction = () => {
      const formData = ComponentManager.getStateForComponent(formId, 'formTableData')
      const isEmpty = Object.values(formData).every(v => v === null || v === undefined)
      if (!formData || isEmpty) {
        const label = this.context.intl.formatMessage({ id: 'perun.admin_console.input_data_error', defaultMessage: 'perun.admin_console.input_data_error' })
        alertUser(true, 'info', label, '', () => ComponentManager.setStateForComponent(formId, null, { saveExecuted: false }))
      } else {
        const url = `${window.server}/ReactElements/createTableRecordFormData/${session}/${tableName}/0`
        this.saveSvarogSysParam(formData, url)
      }
    }

    const form = (
      <GenericForm
        params={'READ_URL'}
        key={formId}
        id={formId}
        className={'hide-all-form-legends'}
        method={`/ReactElements/getTableJSONSchema/${session}/${tableName}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${session}/${tableName}`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${session}/${svarogSysParamObjId}/${tableName}`}
        hideBtns={hideBtns}
        addSaveFunction={addSaveFunction}
        addDeleteFunction={addDeleteFunction}
      />
    )

    const svarogSysParamsFormModal = (
      <Modal customClassBtnModal='customClassBtnModal'
        closeModal={this.closeModal}
        closeAction={this.closeModal}
        modalContent={form}
        modalTitle={modalTitle}
        nameCloseBtn={this.context.intl.formatMessage({ id: 'perun.adminConsole.close', defaultMessage: 'perun.adminConsole.close' })}
      />
    )

    this.setState({ svarogSysParamsFormModal })
  }

  closeModal = () => {
    this.setState({ svarogSysParamsFormModal: undefined })
  }

  render() {
    const { grid, svarogSysParamsFormModal } = this.state
    return (
      <React.Fragment>
        <div className='user-mng-header'>
          <p>{this.context.intl.formatMessage({ id: 'perun.user_mng', defaultMessage: 'perun.user_mng' })}</p>
        </div>
        <div className='admin-console-grid-container'>{grid}</div>
        {svarogSysParamsFormModal}
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  session: state.security.svSession
})

SvarogSystemParams.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(SvarogSystemParams)
