import React from 'react'
import axios from 'axios'
import { ComponentManager, GenericForm, ExportableGrid, Modal, PropTypes } from '../../client'
import { alertUser, GridManager } from '../../elements'
import { connect } from 'react-redux'

/* name of the table, if needed change only here */
const tableName = 'SVAROG_SYS_PARAMS'
class SvarogSystemParams extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showAclModal: '',
    }
  }

  componentDidMount() {
    this.showInitGrid()
  }

  componentWillUnmount() {
    ComponentManager.cleanComponentReducerState(tableName + '_GRID')
  }

  showInitGrid = () => {
    let grid = <ExportableGrid
      gridType={'READ_URL'}
      key={tableName + '_GRID'}
      id={tableName + '_GRID'}
      configTableName={'/ReactElements/getTableFieldList/%session/' + tableName}
      dataTableName={'/ReactElements/getObjectsByParentId/%session/0/' + tableName + '/100000'}
      onRowClickFunct={this.onRowClickFn}
      customButton={() => this.addSysParam('add')}
      customButtonLabel={this.context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
      toggleCustomButton={true}
      additionalButtonLabel={this.context.intl.formatMessage({ id: 'perun.admin_console.change_delete', defaultMessage: 'perun.admin_console.change_delete' })}
      additionalButton={() => this.editSysParam('edit')}
      heightRatio={0.75}
      refreshData={true}
    />
    ComponentManager.setStateForComponent(tableName + '_GRID', null, {
      onRowClickFunct: this.onRowClickFn,
      customButton: () => this.addSysParam('add'),
      additionalButton: () => this.editSysParam('edit')
    })
    this.setState({ showGrid: grid })
  }

  /* notification type add or edit/delete */
  addSysParam = (actionType) => {
    if (actionType) {
      let urlSaveForm
      let objectId = 0
      let isForDelete = false
      let modalTitle
      switch (actionType) {
        case 'add': {
          urlSaveForm = window.server + '/ReactElements/createTableRecordFormData/' + this.props.svSession + '/' + tableName + '/' + objectId
          modalTitle = this.context.intl.formatMessage({ id: 'perun.generalLabel.add', defaultMessage: 'perun.generalLabel.add' })
        }
          break;
        case 'edit': {
          if (this.state.objId) {
            isForDelete = true
            objectId = this.state.objId
            urlSaveForm = window.server + '/ReactElements/createTableRecordFormData/' + this.props.svSession + '/' + tableName + '/' + 0
            modalTitle = this.context.intl.formatMessage({ id: 'perun.admin_console.change_delete', defaultMessage: 'perun.admin_console.change_delete' })
          }
        }
          break;
      }

      let form = <GenericForm
        params={'READ_URL'}
        key={tableName + '_FORM'}
        id={tableName + '_FORM'}
        method={'/ReactElements/getTableJSONSchema/%session/' + tableName}
        uiSchemaConfigMethod={'/ReactElements/getTableUISchema/%session/' + tableName}
        tableFormDataMethod={'/ReactElements/getTableFormData/%session/' + objectId + '/' + tableName}
        addSaveFunction={(e) => this.getFormData(e, urlSaveForm, actionType)}
        customSave={true}
        customSaveButtonName={this.context.intl.formatMessage({ id: 'perun.generalLabel.save', defaultMessage: 'perun.generalLabel.save' })}
        hideBtns='close'
        addDeleteFunction={isForDelete && this.deleteFormCallback}
      />

      let modal = <Modal
        key={'NotificationEditForm_Modal'}
        modalTitle={modalTitle}
        closeModal={this.closeModal}
        modalContent={form}
      />
      this.setState({ setModal: modal })
    }
  }

  /* delete callback function from genericForm, prepare delete params */
  deleteFormCallback = (id, method, session, params) => {
    let valueToSend = params[4].PARAM_VALUE
    this.deleteAxiosPost(valueToSend)
  }

  /* simple axios post delete method from prepared params from deleteFormCallback */
  deleteAxiosPost(valueToSend) {
    let restUrl = window.server + '/ReactElements/deleteObject/' + this.props.svSession
    let th1s = this
    axios({
      method: 'post',
      data: valueToSend,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      if (response.data) {
        th1s.setState({ setModal: false })
        GridManager.reloadGridData(tableName + '_GRID')
        alertUser(true, response.data.type.toLowerCase(), response.data.message)
      }
    }).catch((err) => {
      th1s.setState({ setModal: false })
      alertUser(true, err.data.type.toLowerCase(), err.data.message)
    })
  }

  /* form callback prepare formData*/
  getFormData = (e, url) => {
    let restUrl = url
    let form_params = e.formData
    this.saveFormData(form_params, restUrl)
  }

  /* simple axios post method with prepared e.formData */
  saveFormData = (form_params, restUrl) => {
    let th1s = this
    axios({
      method: 'post',
      data: encodeURIComponent(JSON.stringify(form_params)),
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (response) {
      if (response.data) {
        alertUser(true, response.data.type.toLowerCase(), response.data.message, null, () => th1s.closeModal())
        GridManager.reloadGridData(tableName + '_GRID')
      }
    })
      .catch(function (error) {
        alertUser(true, 'error', error, '')
      })
  }

  /* hide modal */
  closeModal = () => {
    this.setState({ setModal: false })
  }

  /* check if row is clicked, objId is recieved */
  editSysParam = (whatCase) => {
    if (this.state.objId) {
      this.addSysParam(whatCase)
    } else {
      alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.generalLabel.choose_row_change', defaultMessage: 'perun.generalLabel.choose_row_change' }), null)
    }
  }

  /* on rowClick callback from grid, sets objId */
  onRowClickFn = (id, idx, row) => {
    let objectId = row[`${tableName}.OBJECT_ID`]
    this.setState({ objId: objectId })
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

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

SvarogSystemParams.contextTypes = {
  intl: PropTypes.object.isRequired
}


export default connect(mapStateToProps)(SvarogSystemParams)
