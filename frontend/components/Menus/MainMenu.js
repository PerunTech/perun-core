import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import axios from 'axios'
import createHashHistory from 'history/createHashHistory'
import { store, logoutUser } from '../../model';
import TopNavMenu from './TopNavMenu'
import { alertUser } from '../../elements'
import { svConfig } from '../../config';
import { iconManager } from '../../assets/svg/svgHolder'
import { changeLanguageAndLocale } from '../../client'
import * as cookies from '../../functions/cookies'
// main menu top- tells the Main app parent which function needs to be dispatched
// or which grid should be shown in the main content
class MainMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      navbarImgJson: [],
      languageOptions: [],
      stateTooltip: this.props.stateTooltip,
      isActive: false,
      createdUrl: false,
      currentUser: '',
      activeLanguage: ''
    }
    this.hashHistory = createHashHistory()
    this.unmountRegister = this.unmountRegister.bind(this)
    this.getCurrentUser = this.getCurrentUser.bind(this)
  }

  componentDidMount() {
    this.getNavbarImgJson()
    this.getLanguageOptions()
    this.getCurrentUser()
  }

  getNavbarImgJson() {
    const url = `${window.location.origin}${window.assets}/json/config/NavbarImg.json`
    fetch(url).then(res => res.json()).then(json => {
      this.setState({ navbarImgJson: json })
    }).catch(err => { throw err })
  }

  getLanguageOptions() {
    const url = `${window.location.origin}${window.assets}/json/config/LanguageOptions.json`
    fetch(url).then(res => res.json()).then(json => {
      this.setState({ languageOptions: json })
    }).catch(err => { throw err })
  }

  getCurrentUser() {
    const verbPath = `SvSecurity/getPersonalUserInfo/${this.props.token}/user_info`
    const url = `${window.server}/${verbPath}`
    axios.get(url).then(res => {
      if (res?.data && res?.data?.data) {
        if (res.data.data['com.prtech.svarog_common.DbDataObject'] && res.data.data['com.prtech.svarog_common.DbDataObject'].values) {
          const values = res.data.data['com.prtech.svarog_common.DbDataObject'].values
          values.forEach(value => {
            if (value.USER_NAME) {
              store.dispatch({ type: 'GET_CURRENT_USER_NAME', payload: value.USER_NAME })
              this.setState({ currentUser: value.USER_NAME })
            }
          })
        }
      }
    }).catch(err => {
      const title = err.response?.data?.title || this.context.intl.formatMessage({
        id: 'perun.something_went_wrong', defaultMessage: 'perun.something_went_wrong'
      })
      const message = err.response?.data?.message || err
      alertUser(true, 'error', title, message)
    })
  }

  /* NOT HERE !!! f.r */
  logout = () => {
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.token
    store.dispatch(logoutUser(restUrl))
    this.hashHistory.push('/')
  }

  unmountRegister() {
    document.getElementById('hideHamb').className = 'hideHambMenu';
    document.getElementById('identificationScreen').className = 'identificationScreen';
    document.getElementById('identificationScreen').innerText = this.context.intl.formatMessage({
      id: 'perun.main_menu', defaultMessage: 'perun.main_menu'
    });
  }

  getLocale = () => {
    const locale = cookies.getCookie('defaultLocale')
    this.setState({ activeLanguage: locale })
  }

  changeLang = (locale, lang) => {
    changeLanguageAndLocale(locale, lang)
  }

  render() {
    return (
      <React.Fragment>
        <ReactTooltip />
        <div id='mainMenu' className='nav-flex'>
          <div className='top-nav-holder nav-flex'>
            {this.state.navbarImgJson?.length > 0 && (
              <React.Fragment>
                {this.state.navbarImgJson.map((item, i) => {
                  return (
                    <React.Fragment key={`${item.id}_${i}`}>
                      {item.href ? (
                        <a key={item.id} href={item.href} target='_blank' rel='noopener noreferrer' id={item.id} className={item.linkClassName}>
                          {item.children?.length > 0 ? (
                            <React.Fragment>
                              {item.children.map(child => {
                                return <img key={child.id} id={child.id} src={child.src} className={child.className} />
                              })}
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              {item.text}
                            </React.Fragment>
                          )}
                        </a>
                      ) : (
                        <img key={item.id} src={item.src} className={item.imgClassName} />
                      )}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            )}
            <Link onClick={this.unmountRegister} to='/main' id='to-home-link'>
              <div id='to-home' className='btn btn_background' data-toggle='tooltip' data-placement='right' title='Home'>
                {iconManager.getIcon('home')}
              </div>
            </Link>
            <div className='display-inline-block'>
              <TopNavMenu />
            </div>
          </div>
          <div className='identificationScreen'>
            <p id='identificationScreen'></p>
          </div>
          <div className='lang-container'>
            {this.state.languageOptions?.length > 0 && this.state.languageOptions.map((element) => {
              return (<p onClick={() => {
                this.changeLang(element.locale, element.language)
                this.getLocale()
              }} className={element.className ? `${element.className} ${this.state.activeLanguage === element.language && 'active-language-internal'}` : 'header-item'}>{element.label}</p>
              )
            }) || <></>}
          </div>
          <div className='nav-flex' style={{ marginRight: '5px' }}>
            <div className='btn btn_background custom-icon-width' style={{ width: '50px' }} data-toggle='tooltip' data-placement='right' title='Current user'>
              {iconManager.getIcon('currentUserIcon')}
            </div>
            <span className='current-user'>{this.state.currentUser}</span>
          </div>
          <div className='nav-flex'>
            <Link to='/main/user_guide'>
              <div className='btn btn_background custom-icon-width' data-toggle='tooltip' data-placement='right' title='documents'>
                {iconManager.getIcon('documentIcon')}
              </div>
            </Link>
            <div onClick={this.logout} className='btn btn_background' data-toggle='tooltip' data-placement='right' title='Logout'>
              {iconManager.getIcon('logout')}
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

MainMenu.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  stateTooltip: state.stateTooltip.stateTooltip,
  token: state.security.svSession
})

export default connect(mapStateToProps)(MainMenu)
