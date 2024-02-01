import React from 'react'
import Announcement from './Announcement'
import ShowNotification from './ShowNotifications'

const Announcements = () => {
  return (
    <div id='main' className='flex'>
      <div className='container-left'>
        <h4 style={{ color: 'black', borderBottom: '3px solid #e8b763' }}>Соопштенија</h4>
        <ShowNotification />
      </div>
      <div className='container-right'>
        <h4 style={{ color: 'black', borderBottom: '3px solid #e8b763' }}>Упатства </h4>
        <Announcement />
      </div>
    </div>
  )
}

export default Announcements
