import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { menuConfig } from '../../../config';
import defaultCSS from './MainMenuTop.module.css';

let mainMenuStyle = ''
// Import Project CSS
import('modulesCSS/MainMenuTop.module.css').then((projectCSS) => {
  // Check if class is present in css, temporary workaround of webpack bug
  // true code should be in catch block
  // github issue https://github.com/webpack/webpack/issues/5662
  if (!projectCSS.checkIfCSSisPresent) {
    console.log('No external style for MainMenuTop.module.css')
    // load defaultCSS
    mainMenuStyle = defaultCSS
  } else {
    mainMenuStyle = projectCSS
  }
  return mainMenuStyle
}).catch(() => {
  // this block never executes and blocks webpack-dev-server terminal
  // webpack bug
  console.log('No external style for MainMenuTop.module.css')
})

// main menu top- tells the Main app parent which function needs to be dispatched
// or which grid should be shown in the main content
class MainMenuTop extends React.Component {
  static propTypes = {
    onMenuItemClick: PropTypes.func,
    showReactTooltip: PropTypes.func,
    printExpire: PropTypes.func,
    logout: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func,
    defaultLinkRoute: PropTypes.string,
    stateTooltip: PropTypes.bool,
    source: PropTypes.string,
    configuration: PropTypes.object,
    mainMenuType: PropTypes.string,
    setObject: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      stateTooltip: this.props.stateTooltip,
      listItemId: 'btn_farm_nav_top',
      linkId: 'btn_farm_link_top',
      imgId: 'btn_farm_span_img',
      hover: false,
      isActive: true
    }
    this.hover.bind(this)
  }

  hover (refName) {
    if (this.state.hover === false) {
      this.state[refName] = true
      this.setState({ [refName]: true })
      this.setState({ hover: true })
    } else if (this.state.hover === true) {
      this.state[refName] = false
      this.setState({ [refName]: false })
      this.setState({ hover: false })
    }
  }

  highlightActivatedElement (listItemId, linkId, imgId) {
    this.setState({
      isActive: true, listItemId, linkId, imgId
    })
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.stateTooltip !== nextProps.stateTooltip) {
      this.setState({ stateTooltip: nextProps.stateTooltip })
    }
  }

  render () {
    const { ...state } = this.state
    const { ...props } = this.props
    let topMenu
    if (!props.configuration && (!props.source || props.source === 'file')) {
      topMenu = menuConfig('MAIN_MENU', this.context.intl).LIST_OF_ITEMS.map((element, index) => {
        const varId = element.ID
        const varFunc = element.FUNCTION
        const cntrlForm = element.CONTROL_FORM
        const filterBy = element.FILTERBY
        const filterVals = element.FILTERVALS
        const listItemId = `${varId}_nav_top`
        const linkId = `${varId}_link_top`
        const imgId = `${varId}_span_img  `

        return (<li
          id={listItemId}
          key={listItemId}
          className='list-group-item'
          data-tip={element.FLOATHELPER}
          data-effect='float'
          data-event-off='mouseout'
          {...varFunc !== 'help' && { onMouseUp: () => this.highlightActivatedElement(listItemId, linkId, imgId) }}
          {...element.SUBMENU === true && { onMouseEnter: () => { props.onMouseEnter(element.TYPE) } }}
          {...!element.IMAGESRC2
            ? ''
            : {
              onMouseOver: () => {
                this.hover(`uniqLiId${index}`)
                this.setState({ isActive: false, [`uniqLiId${index}`]: true })
              },
              onMouseOut: () => {
                this.hover(`uniqLiId${index}`)
                this.setState({ isActive: false, [`uniqLiId${index}`]: false })
              }
            }
          }
          {...varFunc === 'grid' && { onClick: () => { props.onMenuItemClick(element.TYPE, cntrlForm, filterBy, filterVals) } }}
          {...varFunc === 'print' && { onClick: () => { props.printExpire() } }}
          {...varFunc === 'help' && { onClick: () => { props.showReactTooltip() } }}
          {...varFunc === 'userProfile' && { onClick: props.toggleUserProfilePopup }}
          {...varFunc === 'link' && { onClick: props.goToLink }}
          {...varFunc === 'logout' && { onClick: () => { props.logout() } }}
          {...varId === 'btn_notifications' && {
            onClick: props.notificationBadge.toggleNotifications(
              // send setState as callback to set as inactive when opening notifications bug
              () => this.setState({ isActive: false, [`uniqLiId${index}`]: false }))
          }}
          {...varId === 'btn_history' && {
            onClick: props.history.toggleHistory(
              // send setState as callback to set as inactive when opening notifications bug
              () => this.setState({ isActive: false, [`uniqLiId${index}`]: false }))
          }}
        >
          <span className={mainMenuStyle.menu_icon}>
            {varId === 'btn_notifications' && props.notificationBadge.component}
            {varId === 'btn_history' && props.history.component}
            <img
              id={imgId}
              {...!this.state[`uniqLiId${index}`] ? { src: element.IMAGESRC } : { src: element.IMAGESRC2 }}
              {...state.isActive &&
                state.imgId === imgId &&
                state.listItemId === listItemId &&
                { className: mainMenuStyle.image_highlighted }
              }
            />
          </span>
          <a
            {...(varFunc !== 'help' && varFunc !== 'logout') && { ...element.LINK_TO ? { href: `#${element.LINK_TO}` } : { href: `#${props.defaultLinkRoute}` } }}
            {...state.isActive &&
              state.linkId === linkId &&
              state.listItemId === listItemId &&
              { className: mainMenuStyle.link_selected }
            }
            id={linkId}
            key={linkId}
          >
            {element.LABEL}
          </a>
        </li>)
      })
    } else if (props.configuration && props.configuration.data && props.source === 'database') {
      // CONFIGURATION IS RECEIVED FROM THE DATABASE
      topMenu = props.configuration.data[props.mainMenuType].map((element, index) => {
        const varId = element.ID
        const varLabel = element.label
        const varLink = element.route
        const objectConfiguration = element.objectConfiguration
        const varSubmit = element.onSubmit
        const listItemId = `${varId}_nav_top`
        const linkId = `${varId}_link_top`
        const imgId = `${varId}_span_img  `

        return (<li
          id={listItemId}
          key={listItemId}
          className='list-group-item'
          data-tip={element.FLOATHELPER}
          data-effect='float'
          data-event-off='mouseout'
          {...varId === 'LOGOUT' && { onClick: () => { props.logout(varSubmit) } }}
          {...varId === 'HELP' && { onClick: () => { props.showReactTooltip() } }}
          {...(varId !== 'HELP' && varId !== 'LOGOUT') && {
            onMouseUp: () => this.highlightActivatedElement(listItemId, linkId, imgId),
            onClick: () => props.setObject(objectConfiguration, varId)
          }}
        >
          <span className={mainMenuStyle.menu_icon}>
            <img
              id={imgId}
              {...!this.state[`uniqLiId${index}`] ? { src: element.IMAGESRC } : { src: element.IMAGESRC2 }}
              {...state.isActive &&
                state.imgId === imgId &&
                state.listItemId === listItemId &&
                { className: mainMenuStyle.image_highlighted }
              }
            />
          </span>
          <a
            {...varLink && { href: `#${varLink}` }}
            {...state.isActive &&
              state.linkId === linkId &&
              state.listItemId === listItemId &&
              { className: mainMenuStyle.link_selected }
            }
            id={linkId}
            key={linkId}
          >
            {this.context.intl.formatMessage({ id: varLabel, defaultMessage: varLabel })}
          </a>
        </li>)
      })
    }
    return (
      <div id='main_menu_div' className={mainMenuStyle.div_main_menu}>
        {state.stateTooltip && <ReactTooltip />}
        <div id='items_container_right' className={mainMenuStyle.container_right}>
          <div id='menu_container' className={mainMenuStyle.menu_container}>
            <ul id='main_menu_top' className='list-group' >
              {topMenu}
            </ul>
          </div>
          <div id='languages_container' className={mainMenuStyle.lang_container}>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

MainMenuTop.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  stateTooltip: state.stateTooltip.stateTooltip
})

export default connect(mapStateToProps)(MainMenuTop)
