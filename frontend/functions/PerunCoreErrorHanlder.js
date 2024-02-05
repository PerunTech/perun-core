import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types'

/**
* OPTIONAL PARAMETERS
* @param {function} customCallBackErrorFunc - function callback
* @param {string} customErrorLabel - custom error label
*/

class PerunCoreErrorHanlder extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, hasCallback: false };
  }

  static getDerivedStateFromError = () => {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo)
    if (this.props.customCallBackErrorFunc) {
      this.props.customCallBackErrorFunc(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.customErrorLabel) {
        return (
          <>
            <h1>{this.props.customErrorLabel}
            </h1>{this.props.children}
          </>)
      } else {
        return (
          <>
            <h1>{this.context.intl.formatMessage({ id: 'general.errorLabel', defaultMessage: 'general.errorLabel' })}</h1>
            {this.props.children}
          </>);
      }
    } else {
      return this.props.children;
    }
  }
}

PerunCoreErrorHanlder.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(PerunCoreErrorHanlder)