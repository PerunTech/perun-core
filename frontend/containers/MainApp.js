import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { svConfig } from '../config';
import { store, dataToRedux, logoutUser, globalRequest } from '../model';
import { alertUser } from '../elements';
import { MainMenu, Loading, Tour } from 'components/ComponentsIndex'

class MainApp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showReactTooltip: false,
      alert: undefined,
      objectConfiguration: undefined,
      elementId: undefined,
      subObjectConfig: undefined,
      subElementId: undefined,
      sideMenuItemId: undefined,
      sideMenuItemType: undefined,
      isProcessing: false,
      dispatchSource: undefined,
      dataMenuConfig: undefined,
      dataMenuId: undefined,

      /* recieve props from homeMenu and put it in state */
      matchPropsToState: this.props.matchProps
    }
    this.showReactTooltip = this.showReactTooltip.bind(this)
    this.setObject = this.setObject.bind(this)
    this.setSubObject = this.setSubObject.bind(this)
    this.setDataMenu = this.setDataMenu.bind(this)
    this.logout = this.logout.bind(this)
    this.dispatchGlobalRequest = this.dispatchGlobalRequest.bind(this)
  }

  logoutOnException (exceptionTitle, exceptionMessage) {
    this.setState({
      alert: alertUser(true, 'error',
        exceptionTitle,
        exceptionMessage,
        () => {
          localStorage.clear()
          store.dispatch({type: 'LOGOUT_FULFILLED', payload: undefined})
          location.reload()
        },
        undefined, false, undefined, undefined, false, '#e0ab10', true)
    })
  }

  componentWillMount () {
    if (this.props.exceptionTitle && this.props.exceptionMessage) {
      this.logoutOnException(this.props.exceptionTitle, this.props.exceptionMessage)
    }
  }

  replaceParamsWithBoundPropVals (string, props, coreObject) {
    let array = string.split('/')
    for (let i = 0; i < array.length; i++) {
      if (array[i].charAt(0) === '{' && array[i].charAt(array[i].length - 1) === '}') {
        let propName = array[i].slice(1, -1)
        if (props[propName]) {
          array[i] = props[propName]
        } else {
          const objectHierarchy = store.getState().gridConfig.gridHierarchy
          for (let ј = 0; ј < objectHierarchy.length; ј++) {
            if (objectHierarchy[ј].gridId.indexOf(coreObject) > -1) {
              for (let property in objectHierarchy[ј].row) {
                if (Object.prototype.hasOwnProperty.call(objectHierarchy[ј].row, property) && property === propName) {
                  array[i] = objectHierarchy[ј].row[property]
                }
              }
            }
          }
        }
      }
    }
    string = array.join('/')
    return string
  }

  logout (webService) {
    webService = webService.replace('{token}', this.props.token)
    const restUrl = svConfig.restSvcBaseUrl + webService
    store.dispatch(logoutUser(restUrl))
  }

  showReactTooltip () {
    const labels = this.context.intl
    if (store.getState().stateTooltip.stateTooltip === false) {
      dataToRedux(null, 'stateTooltip', 'stateTooltip', true)
      this.setState({
        alert: alertUser(true, 'info',
          labels.formatMessage({ id: 'perun.main.help_activated', defaultMessage: 'perun.main.help_activated' }),
          labels.formatMessage({ id: 'perun.main.help_info', defaultMessage: 'perun.main.help_info' }),
          () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, '#e0ab10', true)
      })
    } else {
      dataToRedux(null, 'stateTooltip', 'stateTooltip', false)
      this.setState({
        alert: alertUser(true, 'info',
          labels.formatMessage({ id: 'perun.main.help_deactivated', defaultMessage: 'perun.main.help_deactivated' }),
          '',
          () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, '#e0ab10', true)
      })
    }
  }

  dispatchGlobalRequest (webService, id, index, elementConfig) {
    let requestLabels
    try {
      requestLabels = elementConfig.actionPrompt
      if (requestLabels) {
        this.setState({alert: alertUser(true,
          'warning',
          requestLabels.title,
          requestLabels.message,
          () => {
            const restUrl = svConfig.restSvcBaseUrl + webService
            store.dispatch(globalRequest(restUrl, id))
            this.setState({isProcessing: true})
          },
          () => this.setState({alert: alertUser(false, 'info', ' ')}),
          true,
          requestLabels.buttonConfirm,
          requestLabels.buttonCancel,
          true,
          '#78aa22',
          true),
        dispatchSource: elementConfig
        })
      }
    } catch (error) {
      console.warn(error)
    }
  }

  generatePrint (webService) {
    const restUrl = svConfig.restSvcBaseUrl + webService
    window.open(restUrl, 'Барање')
  }

  setObject (objectConfiguration, elementId) {
    this.setState({
      objectConfiguration: objectConfiguration,
      elementId: elementId,
      subObjectConfig: undefined,
      subElementId: undefined,
      sideMenuItemId: undefined,
      sideMenuItemType: undefined,
      dataMenuConfig: undefined,
      dataMenuId: undefined
    })
  }

  setSubObject (subObjectConfig, subElementId, sideMenuItemId, sideMenuItemType) {
    this.setState({
      subObjectConfig: undefined,
      subElementId: undefined,
      sideMenuItemId: undefined,
      sideMenuItemType: undefined
    }, () => {
      this.setState({
        subObjectConfig: subObjectConfig,
        subElementId: subElementId,
        sideMenuItemId: sideMenuItemId,
        sideMenuItemType: sideMenuItemType
      })
    })
    if (sideMenuItemId) {
      this.setState({
        dataMenuConfig: undefined,
        dataMenuId: undefined
      })
    }
  }

  setDataMenu (objectConfiguration, varId) {
    this.setState({
      subObjectConfig: undefined,
      subElementId: undefined,
      dataMenuConfig: undefined,
      dataMenuId: undefined
    }, () => this.setState({
      dataMenuConfig: objectConfiguration.configuration,
      dataMenuId: varId
    }))
  }

  render () {
    const { mainMenuType, stateTooltip, steps } = this.props
    const { alert, objectConfiguration, elementId, subObjectConfig, subElementId, sideMenuItemId,
      sideMenuItemType, isProcessing, dataMenuConfig, dataMenuId } = this.state
    let children
    if (this.props.children) {
      children = React.Children.map(this.props.children, child =>
        React.cloneElement(child, {
          objectConfiguration: objectConfiguration,
          elementId: elementId,
          subObjectConfig: subObjectConfig,
          subElementId: subElementId,
          sideMenuItemId: sideMenuItemId,
          sideMenuItemType: sideMenuItemType,
          setSubObject: this.setSubObject,
          setDataMenu: this.setDataMenu,
          dataMenuConfig: dataMenuConfig,
          dataMenuId: dataMenuId
        })
      )
    }
    return (
      <React.Fragment>
        {stateTooltip && steps ? <Tour steps={steps} /> : null}
        {alert}
        {isProcessing && <Loading />}
          <MainMenu
            mainMenuType={mainMenuType}
            showReactTooltip={this.showReactTooltip}
            setObject={this.setObject}
            setSubObject={this.setSubObject}
            dispatchGlobalRequest={this.dispatchGlobalRequest}
            generatePrint={this.generatePrint}
            logout={this.logout}
            source='database'
            key={mainMenuType}
          />
        {/* Following line renders the cloned children with added parent state and props */}
        {children && <div id='mainAppContainer' className='main-container'>
          {children}
        </div>}
      </React.Fragment>
    )
  }
}

MainApp.propTypes = {
  mainMenuType: PropTypes.string.isRequired,
  steps: PropTypes.array
}

MainApp.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  let transitionResult
  let transitionError
  let transitionApp
  let transitionAppConf
  if (state.globalRequestProcessor.result) {
    transitionApp = state.globalRequestProcessor.result.application
    transitionAppConf = state.globalRequestProcessor.result.configuration
    if (state.globalRequestProcessor.result.transition.constructor === Array) {
      transitionResult = state.globalRequestProcessor.result.transition[0]
    } else if (state.globalRequestProcessor.result.transition.constructor === Object) {
      transitionResult = state.globalRequestProcessor.result.transition
    }
  }
  if (state.globalRequestProcessor.error) {
    if (state.globalRequestProcessor.error.constructor === Array && state.globalRequestProcessor.error.length > 1) {
      transitionError = state.globalRequestProcessor.error
    }
  }
  return {
    token: state.security.svSession,
    stateTooltip: state.stateTooltip.stateTooltip,
    exceptionTitle: state.checkForInvalidSession.exceptionTitle,
    exceptionMessage: state.checkForInvalidSession.exceptionMessage,
    transitionResult: transitionResult,
    transitionError: transitionError,
    transitionApp: transitionApp,
    transitionAppConf: transitionAppConf
  }
}

export default connect(mapStateToProps)(MainApp)
