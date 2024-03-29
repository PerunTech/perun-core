import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import Form from 'react-jsonschema-form'
import { ComponentManager, ExportableGrid, Modal, PropTypes } from '../../client'
import { alertUser, GridManager } from '../../elements'
import { getNotificationsFormSchema } from './utils/notificationsFormSchema'
import { flattenObject } from '../../model/utils'

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
    let th1s = this
    const formData = flattenObject(e.formData)
    const data = JSON.parse(JSON.stringify(formData).replaceAll('%', '%25'))
    axios({ method: 'post', data, url, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (response) {
      if (response.data) {
        alertUser(true, response.data.type.toLowerCase(), response.data.message, null, () => th1s.closeModal())
        th1s.reloadGrid(`${tableName}_GRID`)
      }
    }).catch(function (error) {
      console.log(error)
      alertUser(true, error.data.type.toLowerCase(), error.data.message, null, () => th1s.closeModal())
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

    const form = <Form className='notifications-form' schema={schema} uiSchema={uiSchema} formData={data} onSubmit={onSubmit}>
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
    let restUrl = window.server + '/ReactElements/deleteObject/' + this.props.svSession
    axios({ method: 'post', data: selectedRow, url: restUrl, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((response) => {
      if (response.data) {
        this.setState({ setModal: false })
        this.reloadGrid(`${tableName}_GRID`)
        alertUser(true, response.data.type.toLowerCase(), response.data.message)
      }
    }).catch((err) => {
      this.setState({ setModal: false })
      alertUser(true, 'error', err.data.message)
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
