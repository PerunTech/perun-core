import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import style from './styles/UserManager.module.css'
import { alertUser } from '../../elements';
import * as config from 'config/config.js'
import axios from 'axios'
import UsersGrid from './UsersGrid'
import AddUsersForm from './AddUsersForm'
import GroupUsersGrid from './GroupUsersGrid'
import GroupUsersForm from './GroupUsersForm'

class UserManager extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isShown: true,
      showUserMng: false,
      showUsers: false,
      showAddUsers: false,
      showActDeactUsers: false,
      showUsersGroup: false,
      showSvarogTables: false,
      idbr: '',
      id_number: '',
      mail: '',
      showGroups: false,
      showAddGroups: false,
      showGroupPrivileges: false,
      generatedSideNavValues: '',
      showUsersGrid: false
    }
  }

  /* toggle hamburger button */
  toggle = () => {
    this.setState({ isShown: !this.state.isShown, showUserMng: false, showUsersGroup: false, showSvarogTables: false })
  }

  /* show/hide user management */
  showUserMng = () => {
    this.setState({ showUserMng: !this.state.showUserMng, showUsers: false, showAddUsers: false, showActDeactUsers: false, showUsersGroup: false, showSvarogTables: false, showGroups: false, showAddGroups: false, showGroupPrivileges: false })
  }

  /* show/hide users */
  showUsers = () => {
    this.setState({ showUsers: !this.state.showUsers, showAddUsers: false, showActDeactUsers: false, showUsersGroup: false, showSvarogTables: false, showGroups: false, showAddGroups: false, showGroupPrivileges: false })
  }

  /* add users */
  addUsers = () => {
    this.setState({ showUsers: false, showAddUsers: !this.state.showAddUsers, showActDeactUsers: false, showUsersGroup: false, showSvarogTables: false, showGroups: false, showAddGroups: false, showGroupPrivileges: false })
  }

  /* show/hide activate deactivate users */
  actDeactUsers = () => {
    this.setState({ showUsers: false, showAddUsers: false, showActDeactUsers: !this.state.showActDeactUsers, showUsersGroup: false, showSvarogTables: false, showGroups: false, showAddGroups: false, showGroupPrivileges: false })
  }

  /* show/hide group of users */
  showUsersGroup = () => {
    this.setState({ showUserMng: false, showUsers: false, showAddUsers: false, showActDeactUsers: false, showUsersGroup: !this.state.showUsersGroup, showSvarogTables: false, showGroups: false, showAddGroups: false, showGroupPrivileges: false })
  }

  /* show/hide table for users */
  showSvarogTables = () => {
    this.setState({ showUserMng: false, showUsers: false, showAddUsers: false, showActDeactUsers: false, showUsersGroup: false, showSvarogTables: !this.state.showSvarogTables, showGroups: false, showAddGroups: false, showGroupPrivileges: false })
    this.getSvarogTables()
  }

  /* show/hide groups */
  showGroups = () => {
    this.setState({ showUserMng: false, showUsers: false, showAddUsers: false, showActDeactUsers: false, showSvarogTables: false, showGroups: !this.state.showGroups, showAddGroups: false, showGroupPrivileges: false })
  }

  /* show/hide add groups */
  addGroups = () => {
    this.setState({ showUserMng: false, showUsers: false, showAddUsers: false, showActDeactUsers: false, showSvarogTables: false, showGroups: false, showAddGroups: !this.state.showAddGroups, showGroupPrivileges: false })
  }

  /* show hide group privileges */
  groupPrivileges = () => {
    this.setState({ showUserMng: false, showUsers: false, showAddUsers: false, showActDeactUsers: false, showSvarogTables: false, showGroups: false, showAddGroups: false, showGroupPrivileges: !this.state.showGroupPrivileges })
  }

  /* changing input value */
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  /* axios get svarog tables */
  getSvarogTables = () => {
    let type
    const url = config.svConfig.restSvcBaseUrl + config.svConfig.triglavRestVerbs.GET_SVAROG_TABLES + this.props.svSession
    axios.get(url)
      .then((response) => {
        if (response.data) {
          this.iterateSvarogTablesValues(response.data)
        }
      })
      .catch((error) => {
        type = error.response.data.type
        type = type.toLowerCase()
        this.setState({ alert: alertUser(true, type, error.response.data.message, null, this.closeAlert) })
      })
  }

  /* iterate svarog data and create custom sidenav element */
  iterateSvarogTablesValues = (iterateData) => {
    let elementArr = []
    let htmlElementSidenav
    if (iterateData) {
      for (let i = 0; i < iterateData.length; i++) {
        htmlElementSidenav = <div className={`${style['side-nav-el']} ${style['animation-top']}`} onClick={this.svarogTable} id={iterateData[i].id}>{iterateData[i].name}</div>
        elementArr.push(htmlElementSidenav)
      }
      this.setState({ generatedSideNavValues: elementArr })
    }
  }

  /* on row click on svarog table from the generated sidebar values */
  svarogTable = () => { }

  render() {
    const { isShown, showUserMng, showUsers, showAddUsers, showActDeactUsers, showUsersGroup, showGroups, showAddGroups, showGroupPrivileges, showSvarogTables, generatedSideNavValues } = this.state
    return (
      <React.Fragment>
        <div className={`${style['flex-parent']}`}>
          <div className={`${style['sidebar']}`}>
            <div className={`${style['flex-column']}`}>
              <Link to='/main' id='mainModule' key='mainModule' className='redirectLinks'>
                <p><span className='chevron left'>Почетна</span></p>
              </Link>
              <div className={`${style['flex-parent']}`}>
                <div className={`${style['hamburger-button']}`} onClick={this.toggle}>
                  <div className={`${style['lines']}`}>
                    <span>|</span>
                    <span>|</span>
                    <span>|</span>
                  </div>
                </div>
                {isShown && <React.Fragment>
                  <div className={`${style['animation-top']} ${style['elements-parent']}`}>
                    <div className={`${style['side-nav-el']}`} onClick={this.showUserMng} >Уредување корисници</div>
                    <div className={`${style['side-nav-el']}`} onClick={this.showUsersGroup}>Групи на корисници</div>
                    <div className={`${style['side-nav-el']}`} onClick={this.showSvarogTables}>Svarog табели</div>
                    <hr className={`${style['custom-hr']}`} />
                    {showUserMng && <React.Fragment>
                      <div className={`${style['side-nav-el']} ${style['animation-top']}`} onClick={this.showUsers}>Прикажи корисници</div>
                      <div className={`${style['side-nav-el']} ${style['animation-top']}`} onClick={this.addUsers}>Додади корисници</div>
                      <div className={`${style['side-nav-el']} ${style['animation-top']}`} onClick={this.actDeactUsers}>Активирај/Деактивирај корисници</div>
                    </React.Fragment>}
                    {showUsersGroup && <React.Fragment>
                      <div className={`${style['side-nav-el']} ${style['animation-top']}`} onClick={this.showGroups}>Прикажи групи</div>
                      <div className={`${style['side-nav-el']} ${style['animation-top']}`} onClick={this.addGroups}>Додади групи</div>
                      <div className={`${style['side-nav-el']} ${style['animation-top']}`} onClick={this.groupPrivileges}>Привилегии на групи</div>
                    </React.Fragment>}
                    {showSvarogTables && <div className={`${style['sidenav-generated']}`}>
                      {generatedSideNavValues}
                    </div>}
                  </div>
                </React.Fragment>}
              </div>
            </div>
          </div>
          <div className={`${style['content']}`}>
            {showUsers && <UsersGrid />}
            {showAddUsers && <div className={`${style['users-form']}`}><AddUsersForm /></div>}
            {showActDeactUsers && <div>Активирај деактивирај корисници</div>}
            {showGroups && <GroupUsersGrid />}
            {showAddGroups && <div className={`${style['users-form']}`}><GroupUsersForm /></div>}
            {showGroupPrivileges && <div>Привилегии на групи</div>}
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

export default connect(mapStateToProps)(UserManager)