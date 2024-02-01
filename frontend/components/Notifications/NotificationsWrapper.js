import React from 'react'
import { Configurator } from '../../loadConfiguration/Configurator.js'
import Notifications from './Notifications'

export default class NotificationsWrapper extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      count: 0
    }
  }

  /* send custom class to set/change notifications properties f.r */
  render () {
    return (
      <div>
        <Configurator key='notifications' type='SVAROG_NOTIFICATIONS' >
          <Notifications customHolder={this.props.customHolder} customClass={this.props.customClass} count={this.state.count} />
        </Configurator>
      </div>
    )
  }
}
