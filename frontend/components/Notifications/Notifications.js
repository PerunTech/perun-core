import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { notificationAction } from '../../model';
import NotificationBadge, { Effect } from 'react-notification-badge'
import { alertUser } from '../../elements';
import style from './Notifications.module.css'

class Notifications extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      alert: undefined,
      toggleNotifications: false,
      notificationMessages: undefined,
      notificationMessagesCount: 0,
      count: 0,
      customHolder: props.customHolder,
      customClass: props.customClass
    }
  }

  triggerFunc = () => {
    try {
      if (this.props.configuration && this.props.configuration.data.SVAROG_NOTIFICATIONS.objectConfiguration) {
        this.props.notificationAction(this.props.configuration.data.SVAROG_NOTIFICATIONS.objectConfiguration.data.onSubmit)
      }
    } catch (err) {
      console.log('Notifications configuration not found. Skipping')
    }
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  /* interval set on 5min f.r */
  componentWillMount () {
    this.interval = setInterval(this.triggerFunc, 3000000)
    try {
      if (this.props.configuration && this.props.configuration.data.SVAROG_NOTIFICATIONS.objectConfiguration) {
        this.props.notificationAction(this.props.configuration.data.SVAROG_NOTIFICATIONS.objectConfiguration.data.onSubmit)
      }
    } catch (err) {
      console.log('Notifications configuration not found. Skipping')
    }
  }

  componentWillReceiveProps (nextProps) {
    this.menageNotifications(nextProps)
  }

  menageNotifications = (nextProps) => {
    if ((this.props.notificationMessages !== nextProps.notificationMessages) && nextProps.notificationMessages) {
      const notificationMessages = nextProps.notificationMessages.map((element, index) => {
        const notification = <div key={'notificationToolbar' + index}>
          <p className={style.titleNotif}>{element.TITLE.toUpperCase()}</p>
          <p className={style.contentNotif}>{element.MESSAGE}</p>
        </div>
        return (<div id='NOTIFICATION_MSG'
          onClick={(e) => {
            e.preventDefault()
            this.showFullNotification(element.TITLE, element.MESSAGE)
          }}
          className={style.scrollLeft}
          key={'notificationsT' + index}>
          {notification}
        </div>)
      }
      )
      if (!(notificationMessages.length > 0)) {
        this.setState({customClass: ''})
      }
      this.setState({notificationMessages: notificationMessages})
      this.setState({notificationMessagesCount: notificationMessages.length})
    }
  }

  showFullNotification = (title, msg) => {
    this.setState({
      alert: alertUser(
        true,
        'info',
        title,
        msg,
        () => this.setState({alert: alertUser(false, 'info', ' ')}),
        null, null, null, null, null, null, null
      )
    })
  }

  notificationBadge = () => {
    let customBadgeHolder = {'paddingRight': '2px', 'textAlign': '-webkit-right', height: '3px'}
    if (this.props.customHolder) {
      customBadgeHolder = {height: '3px', 'textAlign': '-webkit-right'}
    }
    return <NotificationBadge
      containerStyle={customBadgeHolder}
      count={this.state.notificationMessagesCount}
      effect={Effect.ROTATE_Y}
      style={{'backgroundColor': '#b34501', display: 'block', width: '40px', position: 'initial', top: '24px', left: '15px', bottom: '', right: ''}}
    />
  }

  render () {
    return (
      <div className={style[this.props.customHolder]}>
        {this.state.alert}
        <div className={style[this.state.customClass]} id='notifications' >
          {this.notificationBadge()}
          {this.state.notificationMessages}
        </div>
      </div>
    )
  }
}

Notifications.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
  notificationMessages: state.notificationReducer.notifications
})

const mapDispatchToProps = dispatch => ({
  notificationAction: (wsPath) => {
    dispatch(notificationAction(wsPath))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifications)
