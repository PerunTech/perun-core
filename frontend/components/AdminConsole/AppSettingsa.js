import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios'
import { svConfig } from '../../config';
import { store, logoutUser } from '../../model';
import { GridManager, ComponentManager, alertUser, InputElement } from '../../elements';
// import AddUsersForm from './AddUsersForm'
import UsersGroups from './UsersGroups'
// import GroupUsersForm from './GroupUsersForm'
import { iconManager } from '../../assets/svg/svgHolder'
// import { Link } from 'react-router-dom';
import Modal from '../Modal/Modal'
import GenericForm from '../../elements/form/GenericForm'
import PropTypes from 'prop-types'
import Loading from '../Loading/Loading';
import NotificationsComponent from './NotificationsComponent';
import SvarogAclGrid from './SvarogAclGrid';
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
import SvarogMenu from './SvarogMenu'
import BusinessType from './BusinessType'
import UserManagement from '../User Management/UserManagement';
class AppSettingsa extends React.Component {
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
      if (!this.props.accessAdminConsole) {
        window.history.back()
      }
      if (this.props.svSession) {
        this.setState({ sessionIsGranted: true }, () => this.getMenu())
        if (document.getElementById('identificationScreen')) {
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
    const url = `${window.json}${window.assets}/json/config/AppSettings.json`

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


    /* changing input value */
    onChange = (e) => {
      this.setState({ [e.target.name]: e.target.value })
    }


    logout = () => {
      const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.svSession
      store.dispatch(logoutUser(restUrl))
    }


    closeModal(paramFor) {
      this.setState({ showUsersModal: false, showGroupUsersModal: false, refreshModal: false, showModal: false, updateTableAccessModal: false, editUsersModal: false })
      if (paramFor === 'refreshFarmData') {
        this.setState({ idBr: undefined, idNo: undefined })
      }
    }




    /* add users custom form render */




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
                                  this[el.action](el.actionParam, el.id)
                                }}>
                                <div className={`link_bg`}></div>
                                <div className={`link_title`}>
                                  <div className={`icon`}>
                                    <i className={`list-icon`}>
                                      {iconManager.getIcon(el.icon)}
                                    </i>
                                  </div>
                                  <div className={`menu-links`} ><a><span className={`list-span`}>{el.labelCode}</span></a></div>
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
                {/*  */}
                <UserManagement />
              </div >
            </div >
          </>}
        </React.Fragment>
      )
    }
  }

  const mapStateToProps = state => ({
    svSession: state.security.svSession,
    accessAdminConsole: state.security.accessAdminConsole
  })

AppSettingsa.contextTypes = {
    intl: PropTypes.object.isRequired
  }

export default connect(mapStateToProps)(AppSettingsa)
