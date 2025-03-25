import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { iconManager } from '../../assets/svg/svgHolder'
import { createHashHistory } from 'history'

const history = createHashHistory()
const NotFound = (_props, context) => {
  useEffect(() => {
    transformIdScreen()
  }, [])

  const transformIdScreen = () => {
    const idScreen = document.getElementById('identificationScreen')
    if (idScreen) {
      idScreen.innerText = context.intl.formatMessage({
        id: 'perun.main.not_found_title', defaultMessage: 'perun.main.not_found_title'
      })
    }
  }

  return (
    <div className='not-found-container'>
      <div className='not-found-content'>{iconManager.getIcon('notFound')}</div>
      <p className='not-found-title'>
        {context.intl.formatMessage({ id: 'perun.main.not_found_title', defaultMessage: 'perun.main.not_found_title' })}
      </p>
      <p className='not-found-text'>
        {context.intl.formatMessage({ id: 'perun.main.not_found_text', defaultMessage: 'perun.main.not_found_text' })}
      </p>
      <p onClick={() => history.push('/')} className='not-found-btn'>
        {context.intl.formatMessage({ id: 'perun.main.not_found_btn', defaultMessage: 'perun.main.not_found_btn' })}
      </p>
    </div>
  )
}

NotFound.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default NotFound
