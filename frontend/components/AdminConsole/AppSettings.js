import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios'
import { svConfig } from '../../config';
import { store, logoutUser } from '../../model';
import { GridManager, ComponentManager, alertUser, InputElement } from '../../elements';
// import AddUsersForm from './AddUsersForm'
import GroupUsersGrid from './GroupUsersGrid'
// import GroupUsersForm from './GroupUsersForm'
import { iconManager } from '../../assets/svg/svgHolder'
// import { Link } from 'react-router-dom';
import Modal from '../Modal/Modal'
import GenericForm from '../../elements/form/GenericForm'
import PropTypes from 'prop-types'
import Loading from '../Loading/Loading';
import NotificationsComponent from './NotificationsComponent';
import SvarogAclGrid from './SvarogAclGrid';
import AssignAcl from './AssignAcl';
import CreateAclCodes from './CreateAclCodes'
import DirectAccess from './DirectAccess'
import SystemConfLogs from './SystemConfLogs'
import SvarogSystemParams from './SvarogSystemParams'
import ShowUsersDropDown from './ShowUsers/ShowUsersDropDown';
import OrganizationalUnit from './OrgUnit/OrganizationalUnit';
import GeoLayerTypes from './GeoLayerTypes';
import LabelEditor from './LabelEditorComp/LabelEditor';
import CodeListEditor from './CodeListComp/CodeListEditor';
import UserGroupsForm from './UserGroupsForm';
import UserForm from './UserForm';
import EditUserWrapper from './utils/EditUserWrapper';
import PerunPluginTable from './PerunPluginTable'
class AppSettings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: '',
      isShown: true,
      showUserMng: false,
      userArrowId: '',
      showUsersGroup: false,
      usersGroupArrowId: '',
      showManagePriviledges: false,
      privilegesArrowId: '',
      showModal: '',
      sessionIsGranted: false,
      activeId: '',
      subMenuActiveId: ''
    }
    this.showUsersFn = this.showUsersFn.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.changeUserStatus = this.changeUserStatus.bind(this)
    // this.createAddGroupsFormParams = this.createAddGroupsFormParams.bind(this)
    this.rowClickFn = this.rowClickFn.bind(this)
    this.handleDropDown = this.handleDropDown.bind(this)
    this.changeUserGroups = this.changeUserGroups.bind(this)
    this.createEditUserGroupsModal = this.createEditUserGroupsModal.bind(this)
    this.getUserGroups = this.getUserGroups.bind(this)
    this.getAllGroups = this.getAllGroups.bind(this)
    this.setGroupObjectId = this.setGroupObjectId.bind(this)
    this.tableAccessAxios = this.tableAccessAxios.bind(this)
    this.createUpdateTableAccessModal = this.createUpdateTableAccessModal.bind(this)
    this.saveUpdateTableAcces = this.saveUpdateTableAcces.bind(this)
    this.refreshAllFarmData = this.refreshAllFarmData.bind(this)
    this.postMethodAllFarmData = this.postMethodAllFarmData.bind(this)
    this.editUser = this.editUser.bind(this)
  }

  componentDidMount() {
    if (this.props) {
      if (this.props.svSession) {
        this.setState({ sessionIsGranted: true }, () => this.getMenu())
        if (document.getElementById('identificationScreen')) {
          document.getElementById('identificationScreen').className = 'identificationScreen'
          document.getElementById('identificationScreen').innerText = this.context.intl.formatMessage({ id: 'perun.admin_console.settings', defaultMessage: 'perun.admin_console.settings' })
        }
      } else {
        this.logout()
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.svSession || !nextProps.svSession) {
      this.logout()
    }
  }

  getMenu = () => {
    const url = `${window.location.origin}${window.assets}/json/config/AppSettings.json`

    fetch(url)
      .then(res => res.json())
      .then(json => {
        const menu = json
        if (menu?.navigation?.items?.length > 0) {
          menu.navigation.items.forEach(item => {
            // Assign a label code for every item using the item's ID as part of the label code
            item.labelCode = this.context.intl.formatMessage({
              id: `perun.admin_console.${item.id}`,
              defaultMessage: `perun.admin_console.${item.id}`
            })

            // Check if the item contains a sub-menu
            if (item['sub-menu']) {
              // Get the sub-menu items using the item's action value, since the key is named after it
              item['sub-menu']?.[item.action]?.forEach(subMenuItem => {
                // Assign a label code for every sub-menu item using the sub-menu item's ID as part of the label code
                subMenuItem.labelCode = this.context.intl.formatMessage({
                  id: `perun.admin_console.${subMenuItem.id}`,
                  defaultMessage: `perun.admin_console.${subMenuItem.id}`
                })
              })
            }
          })
        }

        this.setState({ menuItems: menu })
      })
      .catch(err => { throw err });
  }

  /* show card conf grid for entry point module f.r */

  /* show/hide user management */
  showUserMng = () => {
    if (this.state.showUserMng) {
      this.setState({ userArrowId: '' })
    } else {
      this.setState({ userArrowId: 'manage_users' })
    }
    this.setState({ showUserMng: !this.state.showUserMng })
  }

  showUsersGroup = () => {
    if (this.state.showUsersGroup) {
      this.setState({ usersGroupArrowId: '' })
    } else {
      this.setState({ usersGroupArrowId: 'users_groups' })
    }
    this.setState({ showUsersGroup: !this.state.showUsersGroup })
  }

  /* show hide manage group privileges */

  showManagePriviledges = () => {
    if (this.state.showManagePriviledges) {
      this.setState({ privilegesArrowId: '' })
    } else {
      this.setState({ privilegesArrowId: 'manage_priviledges' })
    }
    this.setState({ showManagePriviledges: !this.state.showManagePriviledges })
  }

  managePriviledges = () => {
    this.setState({ showSvarogAcl: !this.state.showSvarogAcl })
  }

  /* changing input value */
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }


  logout = () => {
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.svSession
    store.dispatch(logoutUser(restUrl))
  }

  closeAlert = () => {
    this.setState({ alert: alertUser(false, 'info', '') })
    this.logout()
  }

  showUsersFn() {
    if (this.state.selectedRowStatus && this.state.selectedRowObjId) {
      this.getUserGroups()
    } else {
      this.setState({ alert: alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.missing_user', defaultMessage: 'perun.admin_console.missing_user' }), null) })
    }
  }

  getUserGroups() {
    let type
    const isInGroup = window.server + '/WsAdminConsole/getLinkedGroups/' + this.props.svSession + '/' + this.state.selectedRowObjId
    const th1s = this
    return axios.get(isInGroup)
      .then((response) => {
        if (response.data) {
          th1s.getAllGroups(response.data.data)
        }
      })
      .catch((error) => {
        type = error.response.data.type
        type = type.toLowerCase()
        th1s.setState({ alert: alertUser(true, type, error.response.data.message, null) })
      })
  }

  getAllGroups(dataUsers) {
    let type
    const allGroups = window.server + '/WsAdminConsole/getAllGroups/' + this.props.svSession
    let th1s = this
    axios.get(allGroups)
      .then((response) => {
        if (response.data) {
          th1s.createEditUserGroupsModal(dataUsers, response.data.data)
        }
      })
      .catch((error) => {
        type = error.response.data.type
        type = type.toLowerCase()
        th1s.setState({ alert: alertUser(true, type, error.response.data.message, null) })
      })
  }

  createEditUserGroupsModal(userGroups, allGroups) {
    if (userGroups && allGroups) {
      let userGroupHTML
      let allUserGroupsHtml
      if (userGroups.length > 0) {
        userGroupHTML = <table id='customTableUserGrops' className={`customTable`}>
          <thead>
            <tr className={`customTh`}>
              <th>
                <div className={`table-th-flex`}>
                  <span className={`custom-span-left`}>{this.context.intl.formatMessage({ id: 'perun.admin_console.user_group_label', defaultMessage: 'perun.admin_console.user_group_label' })}</span>
                  <button className={`customDefBtn button-default button-group`} onClick={() => this.setDefaultFunc()}>{this.context.intl.formatMessage({ id: 'perun.admin_console.basic_group', defaultMessage: 'perun.admin_console.basic_group' })} </button>
                  <button className={`customDefBtn button-default button-group`} onClick={() => this.changeUserGroups('remove')}>{iconManager.getIcon('deleteGroup')}{this.context.intl.formatMessage({ id: 'perun.admin_console.remove_group', defaultMessage: 'perun.admin_console.remove_group' })}</button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={`custom-tbody`}>
            {userGroups.map(item => {
              if (item.defaultGroup) {
                return (
                  <tr tabIndex='0' key={item.groupName} className={`customTr`}>
                    <td key={item.groupName} onClick={() => this.setGroupObjectId(item.objectId)} className={`customTd customDefTb`}><span>{item.groupName}</span> <span className='custom-def-tb-span'>{this.context.intl.formatMessage({ id: 'perun.admin_console.basic_group', defaultMessage: 'perun.admin_console.basic_group' })}</span></td>
                  </tr>
                )
              }
              else {
                return (
                  <tr tabIndex='0' key={item.groupName} className={`customTr`}>
                    <td key={item.groupName} onClick={() => this.setGroupObjectId(item.objectId)} className={`customTd`}>{item.groupName}</td>
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      }
      if (allGroups.length > 0) {
        allUserGroupsHtml = <table id='customTableAllGroups' className={`customTable`}>
          <thead>
            <tr className={`customTh`}>
              <th>
                <div className={`table-th-flex`}>
                  <span className={`custom-span-right`}>{this.context.intl.formatMessage({ id: 'perun.admin_console.all_groups', defaultMessage: 'perun.admin_console.all_groups' })}</span>
                  <button className={`button-default button-group`} onClick={() => this.changeUserGroups('add')}>{iconManager.getIcon('addGroup')}{this.context.intl.formatMessage({ id: 'perun.admin_console.add_group', defaultMessage: 'perun.admin_console.add_group' })}</button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={`custom-tbody`}>
            {allGroups.map(item => (
              <tr tabIndex='0' key={item.groupName} className={`customTr`}>
                <td key={item.groupName} onClick={() => this.setGroupObjectId(item.objectId)} className={`customTd`}>{item.groupName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      let modalData = <div className={`admin-console-show-groups-modal`}>
        <div className={`half-width`}>
          <p>{this.context.intl.formatMessage({ id: 'perun.admin_console.selected_user_belongs_to_group', defaultMessage: 'perun.admin_console.selected_user_belongs_to_group' })}: </p>
          <InputElement
            id='searchActiveGroups'
            name='searchActiveGroups'
            placeholder={this.context.intl.formatMessage({ id: 'perun.adminConsole.search_active_groups', defaultMessage: 'perun.adminConsole.search_active_groups' })}
            onChange={() => this.tableSearch('customTableUserGrops', 'searchActiveGroups')}
          />
          {userGroupHTML}
        </div>
        <div className={`half-width`}>
          <p>{this.context.intl.formatMessage({ id: 'perun.admin_console.show_all_groups', defaultMessage: 'perun.admin_console.show_all_groups' })}: </p>
          <InputElement
            id='searchAvailableGroups'
            name='searchAvailableGroups'
            placeholder={this.context.intl.formatMessage({ id: 'perun.adminConsole.search_available_groups', defaultMessage: 'perun.adminConsole.search_available_groups' })}
            onChange={() => this.tableSearch('customTableAllGroups', 'searchAvailableGroups')}
          />
          {allUserGroupsHtml}
        </div>
      </div>
      let usersModal = <Modal customClassBtnModal={'customClassBtnModal'}
        closeModal={this.closeModal}
        closeAction={this.closeModal}
        // submitAction={() => console.log('submitedModalAction')}
        modalContent={modalData}
        modalTitle={this.context.intl.formatMessage({ id: 'perun.admin_console.change_user_group', defaultMessage: 'perun.admin_console.change_user_group' })}
        nameCloseBtn={this.context.intl.formatMessage({ id: 'perun.admin_console.close', defaultMessage: 'perun.admin_console.close' })}
      // nameSubmitBtn='Во ред'
      />
      this.setState({ showUsersModal: usersModal })
    }
  }

  changeUserGroups(updateType) {
    let url
    if (this.state.selectedGroupObjId) {
      url = window.server + '/WsAdminConsole/updateUserGroup/' + this.props.svSession + '/' + this.state.selectedRowObjId + '/' + this.state.selectedGroupObjId + '/' + updateType
      const th1s = this
      axios.get(url)
        .then((response) => {
          if (response.data) {
            th1s.setState({ alert: alertUser(true, response.data.type.toLowerCase(), response.data.message, null), showUsersModal: false })
            th1s.setState({ selectedGroupObjId: '' })
            th1s.getUserGroups()
          } else {
            th1s.setState({ alert: alertUser(true, response.data.type.toLowerCase(), response.data.message, null) })
            th1s.setState({ selectedGroupObjId: '' })
          }
        })
        .catch((error) => {
          let type
          type = error.type.data.type
          type = type.toLowerCase()
          th1s.setState({ alert: alertUser(true, type, error.response.data.message, null) })
          th1s.setState({ selectedGroupObjId: '' })
        })
    } else {
      this.setState({ alert: alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.missing_group', defaultMessage: 'perun.admin_console.missing_group' }), null) })
    }
  }

  setDefaultFunc = () => {
    const th1s = this

    let url = window.server + `/WsAdminConsole/addDefaultUserGroup/${this.props.svSession}/${this.state.selectedRowObjId}/${this.state.selectedGroupObjId}/true`
    axios.get(url)
      .then(res => {
        alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message)
        th1s.setState({ selectedGroupObjId: '' })
        th1s.getUserGroups()
      }).catch(error => {
        alertUser(true, error.data.type.toLowerCase(), error.data.title, error.data.message)
        th1s.setState({ selectedGroupObjId: '' })
      })
  }

  setGroupObjectId(groupObjectId) {
    this.setState({ selectedGroupObjId: groupObjectId })
  }

  rowClickFn(selectedStatus, selectedObjId, selectedUserName) {
    this.setState({ selectedRowStatus: selectedStatus, selectedRowObjId: selectedObjId, selectedRowUserName: selectedUserName })
  }

  closeModal(paramFor) {
    this.setState({ showUsersModal: false, showGroupUsersModal: false, refreshModal: false, showModal: false, updateTableAccessModal: false, editUsersModal: false })
    if (paramFor === 'refreshFarmData') {
      this.setState({ idBr: undefined, idNo: undefined })
    }
  }

  changeUserStatus() {
    if (this.state.selectedRowStatus && this.state.selectedRowObjId) {
      let status
      let showStats
      if (this.state.selectedRowStatus === 'VALID') {
        status = 'INVALID'
        showStats = `${this.context.intl.formatMessage({ id: 'perun.admin_console.deactivate', defaultMessage: 'perun.admin_console.deactivate' })}`
      } else if (this.state.selectedRowStatus === 'INVALID') {
        status = 'VALID'
        showStats = `${this.context.intl.formatMessage({ id: 'perun.admin_console.activate', defaultMessage: 'perun.admin_console.activate' })}`
      }
      let type
      const url = window.server + '/WsAdminConsole/changeUserStatus/' + this.props.svSession + '/' + this.state.selectedRowObjId + '/' + status
      this.setState({
        alert: alertUser(true, 'info', `${showStats} ${this.context.intl.formatMessage({ id: 'perun.admin_console.user_string_one', defaultMessage: 'perun.admin_console.user_string_one' })} ${this.state.selectedRowUserName}`, null, () => {
          axios.get(url)
            .then((response) => {
              if (response.data.type.toLowerCase() === 'success') {
                this.setState({ alert: alertUser(true, response.data.type.toLowerCase(), response.data.message, null) })
                GridManager.reloadGridData('SVAROG_USERS_GRID')
              } else {
                this.setState({ alert: alertUser(true, response.data.type.toLowerCase(), response.data.message, null) })
              }
              this.setState({ showUsersModal: false, selectedRowStatus: '', selectedRowObjId: '' })
              ComponentManager.setStateForComponent('SVAROG_USERS_GRID', 'rowClicked', [])
            })
            .catch((error) => {
              type = error.response.data.type
              type = type.toLowerCase()
              this.setState({ alert: alertUser(true, type, error.response.data.message, null) })
            })
        }, null, 'true', this.context.intl.formatMessage({ id: 'perun.admin_console.okay', defaultMessage: 'perun.admin_console.okay' }), this.context.intl.formatMessage({ id: 'perun.admin_console.back_btn', defaultMessage: 'perun.admin_console.back_btn' }))
      })
    } else {
      this.setState({ alert: alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.missing_user', defaultMessage: 'perun.admin_console.missing_user' }), null) })
    }
  }


  /* simple table search function */
  tableSearch(tableName, searchInput) {
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(searchInput);
    filter = input.value.toUpperCase();
    table = document.getElementById(tableName);
    tr = table.getElementsByTagName("tr")
    for (i = 1; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }


  /* add users custom form render */
  handleDropDown(e, selectedDropDown) {
    if (selectedDropDown) {
      if (selectedDropDown === 'groupType') {
        this.setState({ groupType: e.target.value })
      } else if (selectedDropDown === 'groupSecurityType') {
        this.setState({ groupSecurityType: e.target.value })
      } else if (selectedDropDown === 'groupAccess') {
        this.setState({ groupAccess: e.target.value })
      } else if (selectedDropDown === 'tableAccessObjId') {
        this.setState({ tableAccessObjId: e.target.value })
      }
    }
  }

  /* refresh farm data modal */
  refreshModal = () => {
    let modalData = <React.Fragment>
      <p>{this.context.intl.formatMessage({ id: 'perun.admin_console.update_farm_legend', defaultMessage: 'perun.admin_console.update_farm_legend' })}</p>
      <InputElement placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.enter_fic', defaultMessage: 'perun.admin_console.enter_fic' })} onChange={this.onChange} type='number' name='idBr' value={this.state.idBr} id='idBr' />
      <InputElement placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.enter_embg', defaultMessage: 'perun.admin_console.enter_embg' })} onChange={this.onChange} type='number' name='idNo' value={this.state.idNo} id='idNo' />
    </React.Fragment>
    let refreshModal = <Modal customClassBtnModal={'customClassBtnModal'}
      closeModal={() => this.closeModal('refreshFarmData')}
      modalContent={modalData}
      modalTitle={this.context.intl.formatMessage({ id: 'perun.admin_console.update_farm', defaultMessage: 'perun.admin_console.update_farm' })}
      nameSubmitBtn={this.context.intl.formatMessage({ id: 'perun.admin_console.update', defaultMessage: 'perun.admin_console.update' })}
      submitAction={() => this.simpleAxios('refreshFarmData')}
    />
    this.setState({ refreshModal: refreshModal })
  }

  /* refresh all farm data */
  refreshAllFarmData = () => {
    let modalData = <React.Fragment>
      <div className={`custom-form-element`}>
        <label htmlFor='idBrAllFarmData'>{this.context.intl.formatMessage({ id: 'perun.admin_console.enter_fic_guide', defaultMessage: 'perun.admin_console.enter_fic_guide' })}</label>
        <textarea
          name='idBrAllFarmData'
          className='textArea'
          style={{ width: '100%' }}
          value={this.state.idBrAllFarmData}
          id='idBrAllFarmData'
          rows='3'
          placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.input_for_fic', defaultMessage: 'perun.admin_console.input_for_fic' })}
          onChange={this.onChange} />
      </div>
      <div className={`custom-form-element`}>
        <label htmlFor='idNoAllFarmData'>{this.context.intl.formatMessage({ id: 'perun.admin_console.enter_embg_guide', defaultMessage: 'perun.admin_console.enter_embg_guide' })}</label>
        <textarea
          name='idNoAllFarmData'
          className='textArea'
          style={{ width: '100%' }}
          value={this.state.idNoAllFarmData}
          id='idNoAllFarmData'
          rows='3'
          placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.input_for_embg', defaultMessage: 'perun.admin_console.input_for_embg' })}
          onChange={this.onChange} />
      </div>
    </React.Fragment>
    let refreshModal = <Modal customClassBtnModal={'customClassBtnModal'}
      closeModal={() => this.closeModal('allFarmData')}
      modalContent={modalData}
      modalTitle={this.context.intl.formatMessage({ id: 'perun.admin_console.refresh_all_farm_data', defaultMessage: 'perun.admin_console.refresh_all_farm_data' })}
      nameSubmitBtn={this.context.intl.formatMessage({ id: 'perun.admin_console.update', defaultMessage: 'perun.admin_console.update' })}
      submitAction={() => this.postMethodAllFarmData()}
    />
    this.setState({ refreshModal: refreshModal })
  }

  /* post method to save all farm data params */
  postMethodAllFarmData = () => {
    if (this.state.idBrAllFarmData && this.state.idNoAllFarmData) {
      let restUrl = window.server + '/WsAdminConsole/updateAllFarmData/' + this.props.svSession
      let params = { 'idBrAllFarm': this.state.idBrAllFarmData, 'idNoAllFarm': this.state.idNoAllFarmData }
      let th1s = this
      axios({
        method: 'post',
        data: params,
        url: restUrl,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then((response) => {
        if (response.data) {
          if (response.data.type && response.data.message) {
            th1s.setState({ refreshModal: false })
            alertUser(true, response.data.type.toLowerCase(), response.data.message)
          }
        }
      }).catch((err) => {
        if (err.data) {
          if (err.data.type && err.data.message) {
            alertUser(true, err.data.type.toLowerCase(), err.data.message)
            th1s.setState({ refreshModal: false })
          }
        } else {
          alertUser(true, 'error', err)
        }
      })
    } else {
      alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.admin_console.enter_input_value', defaultMessage: 'perun.admin_console.enter_input_value' }))
    }
  }

  callSimpleAxios = () => {
    let restUrl = window.server + '/WsAdminConsole/executeAll/' + this.props.svSession
    alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.admin_console.read_sys_keys_confirm', defaultMessage: 'perun.admin_console.read_sys_keys_confirm' }), '', () => this.simpleAxios('allExecutors', restUrl), null, true, this.context.intl.formatMessage({ id: 'perun.admin_console.yes', defaultMessage: 'perun.admin_console.yes' }), this.context.intl.formatMessage({ id: 'perun.admin_console.no', defaultMessage: 'perun.admin_console.no' }))
  }

  /* axios that recieves param from appSettingsMenuJson so the function can handle the necessary params */
  simpleAxios = (param, url) => {
    if (param) {
      this.setState({ loading: <Loading /> })
      // let url = restUrl
      let farmDataFlag = true
      // if (param === 'activateDeactivateUpgrade') {
      //   url = window.server + '/WsAdminConsole/setSystemMaintenance/' + this.props.svSession
      // }
      if (param === 'refreshFarmData') {
        url = window.server + '/farmer/updateFarmData/' + this.props.svSession + '/' + this.state.idBr + '/' + this.state.idNo
        farmDataFlag = false
        if (this.state.idNo && this.state.idBr) {
          farmDataFlag = true
        } else {
          alertUser(true, 'error', this.context.intl.formatMessage({ id: 'perun.admin_console.please_enter_embg', defaultMessage: 'perun.admin_console.please_enter_embg' }), null)
        }
      }
      let th1s = this
      if (url) {
        if (farmDataFlag !== false) {
          axios.get(url)
            .then((response) => {
              if (response.data) {
                th1s.setState({ loading: false })
                if (param === 'refreshFarmData') {
                  th1s.closeModal('refreshFarmData')
                }
                alertUser(true, response.data.type.toLowerCase(), response.data.message, null)
              }
            })
            .catch((error) => {
              th1s.setState({ loading: false })
              if (error.data) {
                if (error.data.type) {
                  if (param === 'refreshFarmData') {
                    th1s.closeModal('refreshFarmData')
                  }
                  alertUser(true, error.data.type.toLowerCase(), error.data.message, null)
                }
              } else {
                alertUser(true, 'error', this.context.intl.formatMessage({ id: 'perun.admin_console.system_error', defaultMessage: 'perun.admin_console.system_error' }), this.context.intl.formatMessage({ id: 'perun.admin_console.please_contact_admin', defaultMessage: 'perun.admin_console.please_contact_admin' }))
              }
            })
        }
      }
    }
  }

  tableAccessAxios = (typeFor) => {
    let type
    let url
    if (typeFor === 'saveCustomFormData') {
      url = window.server + '/WsAdminConsole/updateGroup/' + this.props.svSession + '/' + this.state.tableAccessObjId + '/' + this.state.groupAccess
    } else {
      url = window.server + '/WsAdminConsole/getAllGroups/' + this.props.svSession
    }
    this.setState({ loading: <Loading /> })
    let th1s = this
    axios.get(url)
      .then((response) => {
        if (response.data) {
          if (typeFor === 'saveCustomFormData') {
            type = response.data.type
            type = type.toLowerCase()
            alertUser(true, type, response.data.message, null)
            th1s.setState({ updateTableAccessModal: false })
          } else {
            th1s.createUpdateTableAccessModal(response.data)
          }
          this.setState({ loading: false })
        }
      })
      .catch((error) => {
        if (error) {
          if (error.data) {
            type = error.data.type
            type = type.toLowerCase()
            th1s.setState({ alert: alertUser(true, type, error.data.message, null) })
            if (typeFor === 'saveCustomFormData') {

              th1s.setState({ updateTableAccessModal: false })
            }
            this.setState({ loading: false })
          }
        }
      })
  }

  createUpdateTableAccessModal = (data) => {
    let allGroups = data.data
    let option
    let optionsArr = []
    let defaultOption = <option value='default' disabled='disabled' selected>{this.context.intl.formatMessage({ id: 'perun.admin_console.choose_value', defaultMessage: 'perun.admin_console.choose_value' })}</option>
    allGroups.map((group, i) => {
      option = <option key={i} value={group.objectId}>{group.groupName}</option>
      optionsArr.push(option)
    })
    optionsArr.unshift(defaultOption)

    let modalForm = <div id='form'>
      <form className='user-form-container'>
        <div className='user-form-group field field-object'>
          <fieldset>
            <legend id='root_title'>{this.context.intl.formatMessage({ id: 'perun.admin_console.update_table_access', defaultMessage: 'perun.admin_console.update_table_access' })}</legend>
            <div className='form-group field field-string'>
              <label className='control-label' htmlFor='group_access'>{this.context.intl.formatMessage({ id: 'perun.form_labels.group_access', defaultMessage: 'perun.form_labels.group_access' })}<span className='user-requred'>*</span></label>
              <select onChange={(e) => this.handleDropDown(e, 'groupAccess')} value={this.state.groupAccess} name='group_access' id='group_access' className='form-control'>
                <option value='default' disabled='disabled' selected>{this.context.intl.formatMessage({ id: 'perun.admin_console.choose_value', defaultMessage: 'perun.admin_console.choose_value' })}</option>
                <option value='FULL'>Full access</option>
                <option value='READ'>Read only</option>
              </select>
            </div>
            <div className='form-group field field-string'>
              <label className='control-label' htmlFor='table_access'>{this.context.intl.formatMessage({ id: 'perun.admin_console.choose_group', defaultMessage: 'perun.admin_console.choose_group' })}<span className='user-requred'>*</span></label>
              <select onChange={(e) => this.handleDropDown(e, 'tableAccessObjId')} value={this.state.groupAccess} name='table_access' id='table_access' className='form-control'>
                {optionsArr}
              </select>
            </div>
          </fieldset>
        </div>
      </form>
    </div>

    let updateTableAccessModal = <Modal customClassBtnModal={'customClassBtnModal'}
      closeModal={() => this.closeModal()}
      modalContent={modalForm}
      modalTitle={this.context.intl.formatMessage({ id: 'perun.admin_console.update_additional_table_access', defaultMessage: 'perun.admin_console.update_additional_table_access' })}
      nameSubmitBtn={this.context.intl.formatMessage({ id: 'perun.admin_console.update_additional_update', defaultMessage: 'perun.admin_console.update_additional_update' })}
      submitAction={() => this.saveUpdateTableAcces()}
    />
    this.setState({ updateTableAccessModal: updateTableAccessModal })
  }

  saveUpdateTableAcces = () => {
    if (this.state.tableAccessObjId && this.state.groupAccess) {
      this.tableAccessAxios('saveCustomFormData')
    } else {
      alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.admin_console.please_enter_req', defaultMessage: 'perun.admin_console.please_enter_req' }), null)
    }
  }

  editUser() {
    if (this.state.selectedRowStatus && this.state.selectedRowObjId) {
      let urlSaveForm = window.server + '/ReactElements/createTableRecordFormData/' + this.props.svSession + '/SVAROG_USERS/' + this.state.selectedRowObjId
      let modalForm = <GenericForm
        params={'READ_URL'}
        key={'SVAROG_USERS_FORM'}
        id={'SVAROG_USERS_FORM'}
        method={'/ReactElements/getTableJSONSchema/%session/SVAROG_USERS'}
        uiSchemaConfigMethod={'/ReactElements/getTableUISchema/%session/SVAROG_USERS'}
        tableFormDataMethod={'/ReactElements/getTableFormData/%session/' + this.state.selectedRowObjId + '/SVAROG_USERS'}
        addSaveFunction={(e) => this.editUserSaveForm(e, urlSaveForm)} hideBtns='closeAndDelete'
        inputWrapper={EditUserWrapper}
      />
      let editUsersModal = <Modal
        closeModal={() => this.closeModal()}
        modalContent={modalForm}
        modalTitle={this.context.intl.formatMessage({ id: 'perun.admin_console.change_user', defaultMessage: 'perun.admin_console.change_user' })}
      />
      this.setState({ editUsersModal })
    } else {
      this.setState({ alert: alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.missing_user', defaultMessage: 'perun.admin_console.missing_user' }), null) })
    }
  }

  editUserSaveForm = (e, url) => {
    let form_params = e.formData
    let restUrl = url
    let th1s = this
    axios({
      method: 'post',
      data: form_params,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (response) {
      if (response.data) {
        th1s.setState({ editUsersModal: false })
        alertUser(true, response.data.type.toLowerCase(), response.data.message, null)
        GridManager.reloadGridData('SVAROG_USERS_GRID')
        ComponentManager.setStateForComponent('SVAROG_USERS_GRID', 'rowClicked', [])
      }
    })
      .catch(function (error) {
        if (error.data) {
          alertUser(true, error.data.type.toLowerCase(), error.data.message, null)
        }
      })
  }

  setActiveComponent = (component, id) => {
    this.setState({ active: component, activeId: id })
  }

  handleSubMenuClick = (subMenuId) => {
    const subMenuElements = document.getElementsByClassName('sub_menu');
    for (let i = 0; i < subMenuElements.length; i++) {
      subMenuElements[i].classList.remove('active');
    }

    const subMenuElement = document.getElementById(subMenuId);
    if (subMenuElement) {
      subMenuElement.classList.add('active');
    }

    if (subMenuId !== 'update_table_access') {
      this.setState({ subMenuActiveId: subMenuId });
    }
  };

  render() {
    const { refreshModal, isShown, showUsersModal, showGroupUsersModal, loading, showModal, updateTableAccessModal,
      sessionIsGranted, editUsersModal, active, activeId, subMenuActiveId,
    } = this.state
    return (

      <React.Fragment>
        {sessionIsGranted && <>
          {refreshModal}
          {loading}
          {showUsersModal}
          {showGroupUsersModal}
          {updateTableAccessModal}
          {editUsersModal}
          <div className={`flex-parent parent-margin`}>
            <div className={`sidebar`}>
              <div className={`flex-column`}>
                <div className={`flex-parent admin-console-side-bar-content`}>
                  {isShown && <React.Fragment>
                    <nav className={`nav-menu`}>
                      <ul className={`menu-list`}>
                        {this.state.menuItems && this.state.menuItems.navigation.items.map((el, i) => {
                          let isSubMenuActive = false
                          if (this.state.showUserMng && el.id === this.state.userArrowId) {
                            isSubMenuActive = true
                          } else if (this.state.showUsersGroup && el.id === this.state.usersGroupArrowId) {
                            isSubMenuActive = true
                          } else if (this.state.showManagePriviledges && el.id === this.state.privilegesArrowId) {
                            isSubMenuActive = true
                          }
                          return <React.Fragment key={`${el.id}_${i}`}>
                            <li
                              key={el.id}
                              id={el.id}
                              className={el['sub-menu'] ? `var_nav_arrow ${isSubMenuActive ? 'active' : ''}` : `var_nav ${el.id === activeId ? 'active' : ''}`}
                              tabIndex='1'
                              onClick={() => {
                                if (!el['sub-menu'] && isSubMenuActive) { this.handleSubMenuClick(activeId) } else { !el['sub-menu'] && this.handleSubMenuClick(activeId) }
                              }}>
                              <div className={`link_bg`}></div>
                              <div className={`link_title`}>
                                <div className={`icon`}>
                                  <i className={`list-icon`}>
                                    {iconManager.getIcon(el.icon)}
                                  </i>
                                </div>
                                <div className={`menu-links`} onClick={() => this[el.action](el.actionParam, el.id)}><a><span className={`list-span`}>{el.labelCode}</span></a></div>
                              </div>
                            </li>
                            <div>
                              {el['sub-menu'] &&
                                ((emptyArr) => {
                                  for (var property in el['sub-menu']) {
                                    let createState = property
                                    let subElementObject = el['sub-menu'][property]
                                    subElementObject.forEach((subEl) => {
                                      emptyArr.push(this.state[createState] &&
                                        <div onClick={() => {
                                          if (subEl.id === 'update_table_access') {
                                            subEl.action && this[subEl.action](subEl.actionParam && subEl.actionParam)
                                          } else {
                                            this.handleSubMenuClick(subEl.id);
                                            subEl.action && this[subEl.action](subEl.actionParam && subEl.actionParam);
                                          }
                                        }}
                                          key={subEl.id} id={subEl.id}
                                          className={`sub_menu ${subEl.id === subMenuActiveId ? 'active' : ''}`}
                                          tabIndex='1'>{subEl.labelCode}</div>)
                                    })
                                  }
                                  return emptyArr
                                })([])
                              }
                            </div>
                          </React.Fragment>
                        })}
                      </ul>
                    </nav>
                  </React.Fragment>}
                </div>
              </div>
            </div>
            <div className={`content`}>
              {active === 'showUsers' && <ShowUsersDropDown changeUserPassword={this.changeUserPassword} rowClickFn={this.rowClickFn} editUser={this.editUser} showUsersFn={this.showUsersFn} changeUserStatus={this.changeUserStatus} />}
              {active === 'addUsers' && <UserForm />}
              {active === 'showGroups' && <GroupUsersGrid />}
              {showModal}
              {active === 'addGroups' && <UserGroupsForm />}
              {active === 'SvarogAclGrid' && <SvarogAclGrid />}
              {active === 'GeoLayerTypes' && <GeoLayerTypes />}
              {active === 'SvarogSystemParams' && <SvarogSystemParams />}
              {active === 'NotificationsComponent' && <NotificationsComponent />}
              {active === 'CreateAclCodes' && <CreateAclCodes />}
              {active === 'AssignAcl' && <AssignAcl />}
              {active === 'DirectAccess' && <DirectAccess />}
              {active === 'SystemConfLogs' && <SystemConfLogs />}
              {active === 'OrganizationalUnit' && <OrganizationalUnit />}
              {active === 'LabelEditor' && <LabelEditor />}
              {active === 'CodeListEditor' && <CodeListEditor />}
              {active === 'PerunPluginTable' && <PerunPluginTable />}
            </div >
          </div >
        </>}
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

AppSettings.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(AppSettings)