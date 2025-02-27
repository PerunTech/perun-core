import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { svConfig } from '../../../config';
import { Loading } from '../../../components/ComponentsIndex';
import DependentElements from './DependentElements';
import { findWidget, findSectionName } from '../..';

// component which generates the dropdown externally, or in a react jsonschema form
class DependencyDropdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      component: null
    }
  }

  getUiSchema(c) {
    const server = svConfig.restSvcBaseUrl
    const verbPath = svConfig.triglavRestVerbs
    let webCall = verbPath.GET_UISCHEMA
    webCall = webCall.replace('%session', c.props.svSession)
    webCall = webCall.replace('%formWeWant', c.props.tableName)
    const restUrl = `${server}${webCall}`
    return axios.get(restUrl)
  }

  getConfig(c) {
    const server = svConfig.restSvcBaseUrl
    const verbPath = svConfig.triglavRestVerbs
    let webCall = verbPath.GET_FORM_BUILDER
    webCall = webCall.replace('%session', c.props.svSession)
    webCall = webCall.replace('%formWeWant', c.props.tableName)
    const restUrl = `${server}${webCall}`
    return axios.get(restUrl)
  }

  componentDidMount() {
    if (this.props.customDependencyDropdownComponent) {
      this.setState({
        component: <this.props.customDependencyDropdownComponent {...this.props} />
      })
    } else {
      // IF the dropdowns are generated within a @rjsf/core
      if (this.props.formInstance) {
        this.setState({
          component: <DependentElements {...this.props} />
        })
      } else {
        const c = this
        /* The dropdowns are external, so we need to fetch the config and schema
        for the svarog table before generating the elements */
        // c is for component
        c.setState({ loading: true })
        axios.all([this.getUiSchema(c), this.getConfig(c)])
          .then(axios.spread(function (uischema, formConfig) {
            // Both requests are now complete
            const fieldCode = findWidget(uischema.data, 'ui:widget', 'DependencyDropdown')
            const sectionName = findSectionName(uischema.data, fieldCode)
            c.setState({
              component: <DependentElements {...c.props}
                formSchema={uischema.data}
                formConfig={formConfig.data}
                sectionName={sectionName}
                fieldCode={fieldCode}
                elementId={'root_' + sectionName + '_' + fieldCode}
                spread={c.props.spread}
              />,
              loading: false
            })
          })).catch((error) => {
            // error in one or multiple requests
            console.warn(error)
            c.setState({ loading: false })
          })
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.loading && <Loading />}
        {this.state.component}
      </React.Fragment>
    )
  }
}

function mapStateToProps(state) {
  return {
    svSession: state.security.svSession
  }
}

export default connect(mapStateToProps)(DependencyDropdown)
