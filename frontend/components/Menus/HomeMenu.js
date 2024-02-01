import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { MainApp } from 'containers/ContainersIndex'
import { changeLanguageAndLocale } from '../../client'
import * as cookies from '../../functions/cookies'
const External = () => {
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
                {element.label}
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

const HomeMenu = (props) => {
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

export default connect(mapStateToProps)(HomeMenu)

