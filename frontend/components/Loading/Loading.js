import React from 'react'
import PropTypes from 'prop-types'

// progress bar
const Loading = (_props, context) => {
  return (
    <div className='fade-wrapper'>
      <div className='loadd'>
        <div className='loader-text'>
          {context?.intl?.formatMessage({ id: 'perun.main.loading', defaultMessage: 'perun.main.loading' })}
        </div>
        <div className='bar' />
      </div>
    </div>
  )
}

Loading.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default Loading
