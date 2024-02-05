import React from 'react'
import PropTypes from 'prop-types'
import * as utils from '../utils'
import * as config from 'config/config.js'
import { alertUser } from '../../../elements';
import Loading from 'components/Loading/Loading'

export default function LogonFunctions(TargetComponent, validationString, method, onSubmit) {
  class WrappedComponent extends React.Component {
    static propTypes = {
      status: PropTypes.string,
      svTitle: PropTypes.string,
      svMessage: PropTypes.string,
      configuration: PropTypes.object
    }
    constructor(props) {
      super(props)
      this.state = {
        username: '',
        idNo: '',
        eMail: '',
        password: '',
        repeatPassword: '',
        farmer: false,
        showFarmReg: true,
        showUserReg: false,
        errors: {},
        alert: undefined
      }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      if (nextProps.status) {
        let statusType = nextProps.status.toLowerCase()
        if (statusType === 'exception') { statusType = 'error' }
        this.setState({
          alert: alertUser(true, statusType, nextProps.svTitle, nextProps.svMessage,
            () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, '#e0ab10', true)
        })
      }
      if (nextProps.configuration) {
        let statusType = nextProps.configuration.type.toLowerCase()
        if (statusType !== 'success') {
          this.setState({
            alert: alertUser(true, statusType, nextProps.configuration.title, nextProps.configuration.message,
              () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, '#e0ab10', true)
          })
        }
      }
    }

    onSubmit = (e) => {
      const configuration = this.props.configuration.data
      const methodType = configuration[method].methodtype
      let formData
      let webService
      const errors = utils.validateOnSubmit(e, this.state, validationString)
      if (!errors) {
        if (methodType === 'POST') {
          formData = utils.createFormDataFromStateParams(this.state)
          webService = configuration[method].submit
        } else {
          webService = utils.createWebServiceFromStateParams(this.state, configuration[method].submit)
        }
        const restUrl = config.svConfig.restSvcBaseUrl + webService
        this.props[onSubmit](restUrl, methodType, formData)
      } else {
        this.setState({ errors })
      }
    }

    onChange = (e) => {
      // dynamically change component and field state, depending on user input
      const newState = utils.resetValidateOnChange(e, this.state)
      this.setState({ [e.target.name]: newState.newKeyVal[e.target.name], errors: newState.errors })
    }
    onChangeFarmer = (value) => {
      this.setState({ farmer: value })
    }

    render() {
      const isEverythingLoaded = utils.displayLoader(this.props, method)
      return <React.Fragment>
        {!isEverythingLoaded && <Loading />}
        <TargetComponent
          internalComponentState={this.state}
          {...this.props}
          context={this.context}
          onSubmit={this.onSubmit}
          onChange={this.onChange}
          onChangeFarmer={this.onChangeFarmer}
        />
      </React.Fragment>
    }
  }

  TargetComponent.contextTypes = {
    intl: PropTypes.object.isRequired
  }

  return WrappedComponent
}
