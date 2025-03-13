import React from 'react'
import PropTypes from 'prop-types'
import Announcement from './Announcement'
import Notifications from './Notifications'

const Announcements = (_props, context) => {
  return (
    <div id='main' className='flex'>
      <div className='container-left'>
        <h4 style={{ color: 'black', borderBottom: '3px solid #e8b763' }}>
          {context.intl.formatMessage({ id: 'perun.login.announcements', defaultMessage: 'perun.login.announcements' })}
        </h4>
        <Notifications />
      </div>
      <div className='container-right'>
        <h4 style={{ color: 'black', borderBottom: '3px solid #e8b763' }}>
          {context.intl.formatMessage({ id: 'perun.main.guides', defaultMessage: 'perun.main.guides' })}
        </h4>
        <Announcement />
      </div>
    </div>
  )
}

Announcements.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default Announcements
