import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { MainApp } from 'containers/ContainersIndex'
import { changeLanguageAndLocale } from '../../client'
import * as cookies from '../../functions/cookies'
import PropTypes from 'prop-types';
import { store } from '../../model'
import { isValidObject } from '../../functions/utils'
import axios from 'axios'
const External = (_props, context) => {
  const [json, setJson] = useState([])
  const [activeLanguage, setActiveLanguage] = useState('')
  useEffect(() => {
    getHeaderJson()
    getLocale()
  }, [])
  const getLocale = () => {
    const locale = cookies.getCookie('defaultLocale')
    setActiveLanguage(locale)
  }

  const getHeaderJson = () => {
    let url = `${window.location.origin}${window.assets}/json/config/Header.json`
    // If the assets context window variable exists (it can be something environment specific), use it as a part of the url
    if (window.assetsContext) {
      url = `${window.location.origin}${window.assets}/json/config/${window.assetsContext}/Header.json`
    }
    fetch(url)
      .then(res => res.json())
      .then(json => setJson(json))
      .catch(err => { throw err })
  }

  return (
    <ul className='nav'>
      {json.map((element) => {
        if (element.route) {
          return (
            <li key={`${element.id}-item`} className='nav-item'>
              <Link to={element.route} id={element.id} key={element.id} className={`nav-link ${element.className ? element.className : 'link-default'}`}>
                {context.intl.formatMessage({ id: `perun.login.${element.label}`, defaultMessage: `perun.login.${element.label}` })}
              </Link>
            </li>
          )
        } else if (element.img) {
          return (
            <li key={`${element.id}-item`} className='nav-item'>
              <img id={element.id} key={element.id} src={element.img} alt={element.label} className={element.className ? element.className : 'header-img'} />
            </li>
          )
        } else if (element.language) {
          return (
            <li key={`${element.id}-item`} className='nav-item'>
              <p onClick={() => {
                changeLang(element.locale, element.language)
                getLocale()
              }} className={element.className ? `${element.className} ${activeLanguage === element.language && 'active-language'}` : 'header-item'}>{element.label}</p>
            </li>
          )
        } else {
          return (
            <li key={`${element.id}-item`} className='nav-item'>
              <span id={element.id} className={element.className ? element.className : 'header-item'} key={element.id}>
                {element.label}
              </span>
            </li>
          )
        }
      })}
    </ul >
  )
}

const Internal = () => {
  return <MainApp mainMenuType='SERVICE_MENU' />
}

const changeLang = (locale, lang) => {
  changeLanguageAndLocale(locale, lang)
}

const ssoAltLogin = () => {
  if (window.sessionToken) {
    axios.get(`${window.server}/SvSecurity/configuration/getConfiguration/undefined/LOGIN`).then(res => {
      if (res.data.data.sso_config && isValidObject(res.data.data.sso_config, 1)) {

        const data = {
          "type": "SUCCESS",
          "title": "login.success",
          "message": "login.success",
          "label_code": null,
          "data": {
            "token": `${window.sessionToken}`,
          },
          "saml": true
        }
        store.dispatch({ type: 'LOGIN_FULFILLED_SAML', payload: data })
        let currentURL = window.location.href;
        // Extract the session token and remove it from the URL
        let newURL = currentURL.replace(/(\?session=[^#]*)/, '');

        // Replace the URL in the history without reloading the page
        window.history.replaceState({}, document.title, newURL);

        // Clear the session token
        window.sessionToken = undefined;
      }
    }).catch(err => { console.error(err) })
  }
}

const HomeMenu = (props) => {
  useEffect(() => {
    ssoAltLogin()
  }, [])

  let className = 'navbar sticky-top justify-content-end navbar-styled fadeIn '
  return <React.Fragment>
    {!props.svSession &&
      <div id='header' className={'header fadeIn'}>
      </div>
    }
    <div id='navbar' className={!props.svSession ? className += 'hide-navbar' : className}>
      {!props.svSession ? <External /> : <Internal />}
    </div>
  </React.Fragment>
}

const mapStateToProps = (state) => {
  return {
    svSession: state.security.svSession
  }
}

External.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(HomeMenu)
