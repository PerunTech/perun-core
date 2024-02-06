import React from 'react'
import { store } from '../../model';
import { FormManager, ComponentManager } from 'components/ComponentsIndex'

export default class GroupUsersForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showForm: ''
    }
  }

  UNSAFE_componentWillMount() {
    this.generateUsersForm()
  }

  generateUsersForm() {
    const formId = 'SVAROG_USER_GROUPS_FORM'
    const params = []
    params.push({
      'PARAM_NAME': 'formWeWant',
      'PARAM_VALUE': 'SVAROG_USER_GROUPS'
    }, {
      'PARAM_NAME': 'object_id',
      'PARAM_VALUE': '0'
    }, {
      'PARAM_NAME': 'parent_id',
      'PARAM_VALUE': '0'
    }, {
      'PARAM_NAME': 'session',
      'PARAM_VALUE': store.getState().security.svSession
    }, {
      'PARAM_NAME': 'table_name',
      'PARAM_VALUE': 'SVAROG_USER_GROUPS'
    })

    let dataForm = FormManager.generateForm(formId, formId,
      params, 'formData', 'GET_FORM_BUILDER_MAVEN', 'GET_UISCHEMA_MAVEN', 'GET_DATA_FROM_FORM_MAVEN',
      null, null, null, null, 'form-container', null, 'close', null)
    ComponentManager.setStateForComponent(formId, null, { onAlertClose: this.updateSelectedRecord })
    this.setState({ showForm: dataForm })
  }
  render() {
    const { showForm } = this.state
    return (
      <div>{showForm}</div>
    )
  }
}