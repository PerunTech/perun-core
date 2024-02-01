import React from 'react'
import axios from 'axios'
import { svConfig } from '../../config';
import { store } from '../../model';
import { FormManager, alertUser } from '../../elements';

class SystemForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showForm: null
    }
  }

  componentDidMount () {
    this.generateWizardForm()
  }

  generateWizardForm () {
    const formId = this.props.id
    const params = []
    params.push({
      'PARAM_NAME': 'formWeWant',
      'PARAM_VALUE': this.props.formId
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
      'PARAM_VALUE': this.props.formId
    })

    let dataForm = FormManager.generateForm(formId, formId,
      params, 'formData', 'GET_FORM_BUILDER_MAVEN', 'GET_UISCHEMA_MAVEN', 'GET_DATA_FROM_FORM_MAVEN',
      null, this.saveWizardParams, null, null, 'form-container', null, 'close', null)
    this.setState({showForm: dataForm})
  }

  saveWizardParams = (e) => {
    let type
    let component = this
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.SAVE_FORM_CONF + store.getState().security.svSession
    let batch_params = e.formData
    axios({
      method: 'post',
      data: batch_params,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function () {
      component.setState({ alert: alertUser(true, 'success', 'Успешно внесени параметри', null, component.props.callbackFunc) })
    })
      .catch(function (response) {
        type = response.response.data.type
        type = type.toLowerCase()
        component.setState({ alert: alertUser(true, type, response.response.data.message, null, component.closeAndlogout) })
      })
  }

  closeAndlogout = () => {
    this.setState({ alert: alertUser(false, 'info', '') })
    this.logout()
  }

  render () {
    const { showForm } = this.state
    return (
      <div className='animation-right'>{showForm}</div>
    )
  }
}

export default SystemForm