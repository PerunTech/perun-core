import React from 'react'
import { ExportableGrid, PropTypes } from '../../client';
import { connect } from 'react-redux';
import axios from 'axios'
import { ComponentManager, ReactBootstrap, InputElement, alertUser, GridManager } from '../../elements';
const { Modal } = ReactBootstrap;
import GenericForm from '../../elements/form/GenericForm'
import EditUserGroupWrapper from './utils/EditUserGroupWrapper';
import AclPerGroup from './AclPerGroup/AclPerGroup';
import Loading from '../Loading/Loading';
import md5 from 'md5'
class UsersGroups extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      grid: null,
      modalContentEdit: false,
      modalContentGroupDetails: [],
      groupMembers: null
    }
    this.onRowClick = this.onRowClick.bind(this)
    this.showUserGroupsFn = this.showUserGroupsFn.bind(this)
    this.editUserGroupsFn = this.editUserGroupsFn.bind(this)
    this.saveForm = this.saveForm.bind(this)
  }

  componentDidMount() {
    this.generateGroupUsersGrid()
  }

  generateGroupUsersGrid = () => {
    const groupUsersGridId = 'SVAROG_USER_GROUP_GRID'
    const grid = <ExportableGrid
      key={groupUsersGridId}
      id={groupUsersGridId}
      gridType={'READ_URL'}
      configTableName={`/ReactElements/getTableFieldList/%session/SVAROG_USER_GROUPS`}
      dataTableName={`/ReactElements/getTableData/%session/SVAROG_USER_GROUPS/0`}
      onRowClickFunct={this.onRowClick}
      heightRatio={0.75}
      refreshData={true}
    />
    ComponentManager.setStateForComponent(groupUsersGridId, null, {
      onRowClickFunct: this.onRowClick,

    })

    this.setState({
      grid: grid
    })
  }

  componentWillUnmount() {
    ComponentManager.cleanComponentReducerState('SVAROG_USER_GROUP_GRID');
  }

  editUserGroupsFn = (objectId) => {
    let modalData = <GenericForm
      params={'READ_URL'}
      key={'SVAROG_USER_GROUPS'}
      id={'SVAROG_USER_GROUPS'}
      method={'/ReactElements/getTableJSONSchema/%session/' + 'SVAROG_USER_GROUPS'}
      uiSchemaConfigMethod={'/ReactElements/getTableUISchema/%session/' + 'SVAROG_USER_GROUPS'}
      tableFormDataMethod={'/ReactElements/getTableFormData/%session/' + objectId + '/' + 'SVAROG_USER_GROUPS'}
      customSave={true}
      customSaveButtonName={this.context.intl.formatMessage({ id: 'perun.adminConsole.save', defaultMessage: 'perun.adminConsole.save' })}
      addSaveFunction={(e) => this.saveForm(e, 'editUserGroup')}
      hideBtns='closeAndDelete'
      inputWrapper={EditUserGroupWrapper}
    />
    this.setState({ modalContentEdit: modalData });
  }
  showUserGroupsFn(selectedGroupObjId, selectedGroupName) {
    this.setState({ selectedRowGroupObjId: selectedGroupObjId, selectedRowGroupName: selectedGroupName })
    if (selectedGroupName === 'USERS') {
      this.setState({ groupMembers: false });
      return;
    } else {
      let type
      let content
      let contentArr = []
      let customTable = undefined
      let custmInput = undefined
      let modalContentArr = []
      const url = window.server + '/WsAdminConsole/getLinkedUsers/' + this.props.svSession + '/' + selectedGroupObjId
      this.setState({ loading: <Loading /> })
      axios.get(url)
        .then((response) => {
          if (response.data.data) {
            if (response.data.type.toLowerCase() === 'success') {
              let arr = response.data.data
              for (let i = 0; i < arr.length; i++) {
                content = <tr key={arr[i] + arr[i].userName + arr[i].eMail} className={`customTr`}>
                  <td key={arr[i].userName + arr[i]} className={`customTd`}>{arr[i].userName}</td>
                  <td key={arr[i]} className={`customTd`}>{arr[i].pin}</td>
                  <td key={arr[i].eMail + arr[i]} className={`customTd`}>{arr[i].eMail}</td>
                </tr>
                contentArr.push(content)
              }
              this.setState({ linkedUsersState: contentArr })
              customTable =
                <table id='customTableLinkedUsers' className={`customTable slowLoad`}>
                  <thead>
                    <tr className={`customTh`}>
                      <th>{this.context.intl.formatMessage({ id: 'perun.adminConsole.user_name', defaultMessage: 'perun.adminConsole.user_name' })}: </th>
                      <th>{this.context.intl.formatMessage({ id: 'perun.adminConsole.pin', defaultMessage: 'perun.adminConsole.pin' })}: </th>
                      <th>{this.context.intl.formatMessage({ id: 'perun.adminConsole.e_mail', defaultMessage: 'perun.adminConsole.e_mail' })}: </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.linkedUsersState}
                  </tbody>
                </table>
              custmInput = <InputElement id='searchInput' name='searchInput' placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.search_user', defaultMessage: 'perun.admin_console.search_user' })} onChange={() => this.props.tableSearch('customTableLinkedUsers', 'searchInput')} />
              modalContentArr.push(custmInput, customTable)
              this.setState({ groupMembers: true });
            }
            else if (response.data.type.toLowerCase() === 'warning') { this.setState({ groupMembers: false }); }
            let aclPerGroup = <AclPerGroup groupId={selectedGroupObjId} />
            modalContentArr.push(aclPerGroup)
            this.setState({ modalContentGroupDetails: modalContentArr, loading: false })
          } else {
            this.setState({ loading: false })
            alertUser(true, response.data.type.toLowerCase(), response.data.message, null)
          }
        })
        .catch((error) => {
          console.error(error);
          alertUser(true, 'error', error.response?.data?.title || error, error.response?.data?.message || '');
        })
    }
  }

  saveForm(e, forForm) {
    let form_params
    let formCompleted
    if (forForm === 'saveUser') {
      e.preventDefault()
      if ((this.state.userName && this.state.userName.length > 0) && (this.state.userEmail && this.state.userEmail.length > 0) && (this.state.pin && this.state.pin.length > 0) && (this.state.userPassword && this.state.userPassword.length > 0) && (this.state.confUserPassword && this.state.confUserPassword.length > 0)) {
        if (this.state.userPassword === this.state.confUserPassword) {
          form_params = { 'userName': this.state.userName, 'firstName': this.state.firstName, 'lastName': this.state.lastName, 'userEmail': this.state.userEmail, 'userPassword': md5(this.state.userPassword), 'confUserPassword': md5(this.state.confUserPassword), 'pin': this.state.pin }
          formCompleted = 'saveUser'
        } else {
          this.setState({ alert: alertUser(true, 'error', this.context.intl.formatMessage({ id: 'perun.admin_console.inputs_no_match', defaultMessage: 'perun.admin_console.inputs_no_match' })) })
        }
      } else {
        this.setState({ alert: alertUser(true, 'error', this.context.intl.formatMessage({ id: 'perun.adminConsole.mandatory_field', defaultMessage: 'perun.adminConsole.mandatory_field' })) })
      }
    } else if (forForm === 'saveUserGroup') {
      e.preventDefault()
      if ((this.state.groupName && this.state.groupName.length > 0) && (this.state.groupType) && (this.state.groupSecurityType) && (this.state.groupAccess) && (this.state.groupEmail && this.state.groupEmail.length > 0)) {
        form_params = { 'GROUP_NAME': this.state.groupName, 'GROUP_TYPE': this.state.groupType, 'GROUP_SECURITY_TYPE': this.state.groupSecurityType, 'E_MAIL': this.state.groupEmail, 'groupAccess': this.state.groupAccess }
        formCompleted = 'saveUserGroup'
      } else {
        this.setState({ alert: alertUser(true, 'error', this.context.intl.formatMessage({ id: 'perun.adminConsole.mandatory_field', defaultMessage: 'perun.adminConsole.mandatory_field' })) })
      }
    } else if (forForm === 'editUserGroup') {
      form_params = e.formData
      formCompleted = 'saveUserGroup'
    }

    if (formCompleted === 'saveUser' || formCompleted === 'saveUserGroup') {
      this.setState({ loading: <Loading /> })
      let restUrl = window.server + '/WsAdminConsole/' + formCompleted + '/' + this.props.svSession
      axios({
        method: 'post',
        data: form_params,
        url: restUrl,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then((response) => {
        if (response.data) {
          this.setState({ loading: false })
          if (forForm === 'saveUserGroup' || forForm === 'editUserGroup') {
            GridManager.reloadGridData('SVAROG_USER_GROUP_GRID')
            this.setState({ alert: alertUser(true, response.data.type.toLowerCase(), response.data.message, null), active: 'showGroups', showModal: false })
          } else if (forForm === 'saveUser') {
            GridManager.reloadGridData('SVAROG_USERS_GRID')
            this.setState({
              alert: alertUser(true, response.data.type.toLowerCase(), response.data.message, null),
              active: 'showUsers'
            })
          }
        }
        formCompleted = ''
      }).catch((error) => {
        this.setState({ loading: false })
        alertUser(true, 'error', error.response?.data?.title || error, error.response?.data?.message || '');
        formCompleted = ''
      })
    }
  }

  onRowClick(gridId, rowId, row) {
    const selectedGroupName = row['SVAROG_USER_GROUPS.GROUP_NAME']
    const selectedGroupObjId = row['SVAROG_USER_GROUPS.OBJECT_ID']
    this.setState({ objId: selectedGroupObjId, groupName: selectedGroupName }, () => {
      this.editUserGroupsFn(selectedGroupObjId, selectedGroupName);
      this.showUserGroupsFn(selectedGroupObjId, selectedGroupName)
    });
  }

  render() {
    const { grid, modalContentEdit, modalContentGroupDetails, loading, groupMembers } = this.state
    return (
      <React.Fragment >
        <div className='admin-console-grid-container'>
          {grid}
          {loading}
          {modalContentEdit && (
            <Modal className='admin-console-unit-modal' show={modalContentEdit} onHide={() => { this.setState({ modalContentEdit: false, modalContentGroupDetails: false }) }}>
              <Modal.Header closeButton>
                <Modal.Title>{this.context.intl.formatMessage({ id: 'perun.admin_console.user_group_details', defaultMessage: 'perun.admin_console.user_group_details' })}</Modal.Title>
              </Modal.Header>
              <Modal.Body className='admin-console-unit-modal-body'>
                {modalContentEdit}
                <div className={`${groupMembers ? 'group_member' : 'no_group_member'}`}>
                  {groupMembers ? this.context.intl.formatMessage({ id: 'perun.admin_console.group_members', defaultMessage: 'perun.admin_console.group_members' }) : this.context.intl.formatMessage({ id: 'perun.admin_console.not_found_group_members', defaultMessage: 'perun.admin_console.not_found_group_members' })}
                </div>
                {modalContentGroupDetails}
              </Modal.Body>
              <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
            </Modal>
          )}

        </div>
      </React.Fragment>
    )
  }
}
const mapStateToProps = state => ({
  svSession: state.security.svSession
})

UsersGroups.contextTypes = {
  intl: PropTypes.object.isRequired
}
export default connect(mapStateToProps)(UsersGroups)

