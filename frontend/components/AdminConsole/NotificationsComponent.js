import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import Form from '@rjsf/core'
import { ComponentManager, ExportableGrid, Modal, PropTypes } from '../../client'
import { alertUser, GridManager } from '../../elements'
import { getNotificationsFormSchema } from './utils/notificationsFormSchema'
import { flattenObject } from '../../model/utils'
import validator from '@rjsf/validator-ajv8';
/* name of the table, if needed change only here */
const tableName = 'SVAROG_NOTIFICATION'
class NotificationsComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showGrid: null,
      setModal: null,
      selectedRow: undefined,
    }
  }

  componentDidMount() {
    this.showInitGrid()
  }

  componentWillUnmount() {
    ComponentManager.cleanComponentReducerState(tableName + '_GRID')
  }

  /* initial notifications grid */
  showInitGrid = () => {
    let grid = <ExportableGrid
      gridType={'READ_URL'}
      key={tableName + '_GRID'}
      id={tableName + '_GRID'}
      configTableName={'/ReactElements/getTableFieldList/%session/' + tableName}
      dataTableName={'/ReactElements/getTableData/%session/' + tableName + '/100000'}
      onRowClickFunct={this.onRowClickFn}
      customButton={() => this.generateForm()}
      customButtonLabel={this.context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
      toggleCustomButton={true}
      heightRatio={0.75}
      refreshData={true}
    />
    ComponentManager.setStateForComponent(tableName + '_GRID', null, {
      onRowClickFunct: this.onRowClickFn,
      customButton: () => this.generateForm()
    })
    this.setState({ showGrid: grid })
  }

  reloadGrid = (gridId) => {
    GridManager.reloadGridData(gridId)
    ComponentManager.setStateForComponent(gridId, 'rowClicked', undefined)
  }

  onSubmit = (e, url) => {
    const formData = flattenObject(e.formData)
    const data = encodeURIComponent(JSON.stringify(formData))
    const reqConfig = { method: 'post', data, url, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    axios(reqConfig).then((res) => {
      if (res.data) {
        const resType = res.data.type
        const title = res.data.title || ''
        const msg = res.data.message || ''
        alertUser(true, resType?.toLowerCase() || 'info', title, msg)
        if (resType?.toLowerCase() === 'success') {
          this.closeModal()
          this.reloadGrid(`${tableName}_GRID`)
        }
      }
    }).catch((error) => {
      console.log(error)
      const title = error.response?.data?.title || error
      const msg = error.response?.data?.message || ''
      alertUser(true, 'error', title, msg)
    })
  }

  onDelete = () => {
    alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.delete_notification', defaultMessage: 'perun.admin_console.delete_notification' }), '',
      () => this.deleteAxiosPost(), () => { }, true, this.context.intl.formatMessage({ id: 'perun.admin_console.yes', defaultMessage: 'perun.admin_console.yes' }), this.context.intl.formatMessage({ id: 'perun.admin_console.no', defaultMessage: 'perun.admin_console.no' }))
  }

  generateForm = (formData) => {
    const { schema, uiSchema } = getNotificationsFormSchema(this.context)
    const data = formData || {}
    const modalTitle = formData ? this.context.intl.formatMessage({ id: 'perun.admin_console.change_delete', defaultMessage: 'perun.admin_console.change_delete' }) : this.context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })
    const wsPath = `/ReactElements/createTableRecordFormData/${this.props.svSession}/${tableName}/0`
    const url = `${window.server}${wsPath}`
    const onSubmit = (e) => this.onSubmit(e, url)

    const form = <Form validator={validator} className='notifications-form' schema={schema} uiSchema={uiSchema} formData={data} onSubmit={onSubmit}>
      <></>
      <div id='buttonHolder'>
        <div id='btnSeparator' style={{ width: 'auto', float: 'right' }}>
          <button type='submit' id='save_form_btn' className='btn-success btn_save_form'>
            {this.context.intl.formatMessage({ id: 'perun.adminConsole.save', defaultMessage: 'perun.adminConsole.save' })}
          </button>
        </div>
        {formData && <button type='button' id='delete_form_btn' className='btn-danger btn_delete_form' onClick={this.onDelete}>
          {this.context.intl.formatMessage({ id: 'perun.generalLabel.delete', defaultMessage: 'perun.generalLabel.delete' })}
        </button>}
      </div>
    </Form>

    const modal = <Modal key={'NotificationEditForm_Modal'} modalTitle={modalTitle} closeModal={this.closeModal} modalContent={form} />
    this.setState({ setModal: modal })
  }

  /* simple axios post delete method */
  deleteAxiosPost = () => {
    const { selectedRow } = this.state
    const url = window.server + '/ReactElements/deleteObject/' + this.props.svSession
    const data = encodeURIComponent(JSON.stringify(selectedRow))
    const reqConfig = { method: 'post', data, url, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    axios(reqConfig).then((res) => {
      if (res.data) {
        const resType = res.data.type
        const title = res.data.title || ''
        const msg = res.data.message || ''
        alertUser(true, resType?.toLowerCase() || 'info', title, msg)
        if (resType?.toLowerCase() === 'success') {
          this.closeModal()
          this.reloadGrid(`${tableName}_GRID`)
        }
      }
    }).catch((error) => {
      console.error(error)
      const title = error.response?.data?.title || error
      const msg = error.response?.data?.message || ''
      alertUser(true, 'error', title, msg)
    })
  }

  /* hide modal */
  closeModal = () => {
    this.setState({ setModal: false, selectedRow: undefined })
  }

  /* on rowClick callback from grid, sets objId */
  onRowClickFn = (_id, _idx, row) => {
    const formData = {}
    // Remove the tableName (SVAROG_NOTIFICATIONS) part from the selected row object keys
    for (const key in row) {
      if (key.includes(tableName)) {
        const newKey = key.split('.')[1]
        Reflect.set(formData, newKey, row[key])
      }
    }
    // Get and set the appropriate data in their respective sections
    const { OBJECT_ID, PKID, OBJECT_TYPE } = formData
    const finalFormData = {
      OBJECT_ID, PKID, OBJECT_TYPE,
      section_one: { TYPE: formData.TYPE || '', TITLE: formData.TITLE || '' },
      section_two: { MESSAGE: formData.MESSAGE || '' }
    }
    this.generateForm(finalFormData)
    this.setState({ selectedRow: formData })
  }

  render() {
    const { showGrid, setModal } = this.state
    return (
      <React.Fragment>
        <div className='admin-console-grid-container'>{showGrid}</div>
        {setModal}
      </React.Fragment>
    )
  }
}

NotificationsComponent.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

export default connect(mapStateToProps)(NotificationsComponent)
