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
import { submitForm } from '../Logon/utils'
import { isValidObject } from '../../model'
import PerunNavbar from '../PerunNavbar'
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
    this.getLocale()
    this.getCurrentUser()
  }

  getNavbarImgJson() {
    const url = `${window.json}${window.assets}/json/config/NavbarImg.json`
    fetch(url).then(res => res.json()).then(json => {
      this.setState({ navbarImgJson: json })
    }).catch(err => { throw err })
  }

  getLanguageOptions() {
    const url = `${window.json}${window.assets}/json/config/LanguageOptions.json`
    fetch(url).then(res => res.json()).then(json => {
      this.setState({ languageOptions: json })
    }).catch(err => { throw err })
  }

  getCurrentUser() {
    const verbPath = `SvSecurity/getPersonalUserInfo/${this.props.token}/user_info`
    const url = `${window.server}/${verbPath}`
    axios.get(url).then(res => {
      if (res?.data && res?.data?.data) {
        const resData = res.data.data?.['com.prtech.svarog_common.DbDataObject'] || {}
        const defaultUserGroupData = res.data.data?.default_user_group || {}
        const userAvatarData = res.data.data?.user_avatar_file_info || {}
        const userData = {}
        // Get the individual user values, since they're a bit nested
        if (resData && resData.values) {
          const values = resData.values
          values.forEach(value => {
            if (value.USER_NAME) {
              Object.assign(userData, { username: value.USER_NAME })
              this.setState({ currentUser: value.USER_NAME })
            }
          })
        }

        // Get the individual system user values (ex. object ID, parent ID), since they're returned separately from the non-system values
        if (isValidObject(resData, 1)) {
          Object.assign(userData, { userObjectId: resData?.object_id || 0 })
        }

        // Get the individual values for the default user group
        if (isValidObject(defaultUserGroupData, 1)) {
          const defaultUserGroup = {
            groupName: defaultUserGroupData.GROUP_NAME || '',
            groupType: defaultUserGroupData.GROUP_TYPE || '',
            groupObjectId: defaultUserGroupData.object_id || 0,
          }
          Object.assign(userData, { defaultUserGroup })
        }

        // Get the individual values for the user avatar
        if (isValidObject(userAvatarData, 1)) {
          const avatar = {
            objectId: userAvatarData.objectId || 0,
            fileName: userAvatarData.fileName || '',
          }
          Object.assign(userData, { avatar })
        }

        store.dispatch({ type: 'GET_CURRENT_USER_DATA', payload: userData })
      }
    }).catch(err => {
      const title = err.response?.data?.title || this.context.intl.formatMessage({
        id: 'perun.something_went_wrong', defaultMessage: 'perun.something_went_wrong'
      })
      const message = err.response?.data?.message || err
      alertUser(true, 'error', title, message)
    })
  }

  onSamlLogout = () => {
    axios.get(`${window.server}/SvSecurity/configuration/getConfiguration/undefined/LOGIN`).then(res => {
      if (res.data?.data) {
        const configuration = res.data.data
        if (configuration.sso_config && isValidObject(configuration.sso_config, 1)) {
          const sloConfig = configuration.sso_config
          const sloFormKey = sloConfig.SLO_FORM_KEY
          const sloFormValue = sloConfig.SLO_FORM_VALUE.replace('{session}', this.props.token);
          const sloMethod = sloConfig.SLO_METHOD
          const sloUrl = sloConfig.SLO_URL
          axios.get(`${window.server}${sloFormValue}`).then(res => {
            if (res.data) {
              const token = res.data
              submitForm(sloUrl, sloMethod, { [sloFormKey]: token })
            }
          }).catch(err => {
            console.error(err)
            const title = err.response?.data?.title || err
            const msg = err.response?.data?.message || ''
            alertUser(true, 'error', title, msg)
          })
        }
      }

    })
  }

  logout = () => {
    if (this.props?.samlFlag) {
      this.onSamlLogout()
    } else {
      const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.token
      store.dispatch(logoutUser(restUrl))
      this.hashHistory.push('/')
    }

  }

  unmountRegister() {
    document.getElementById('identificationScreen').innerText = this.context.intl.formatMessage({
      id: 'perun.main_menu', defaultMessage: 'perun.main_menu'
    });
  }

  getLocale = () => {
    const locale = cookies.getCookie('defaultLocale')
    this.setState({ activeLanguage: locale })
  }

  changeLang = (locale, lang) => {
    this.switchServerLanguage(lang, locale)
  }

  switchServerLanguage = (lang, locale) => {
    let url = window.server + `/SvSecurity/i18n/${lang}/perun/${this.props.token}`
    axios.get(url).then(() => {
      if (locale) {
        changeLanguageAndLocale(locale, lang)
      }
    }).catch(err => {
      console.error(err)
    })
  }

  render() {
    return (
      <React.Fragment>
        <PerunNavbar logout={this.logout} location={window.location} />
      </React.Fragment>
    )
  }
}

MainMenu.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  stateTooltip: state.stateTooltip.stateTooltip,
  token: state.security.svSession,
  samlFlag: state.security?.saml
})

export default connect(mapStateToProps)(MainMenu)
