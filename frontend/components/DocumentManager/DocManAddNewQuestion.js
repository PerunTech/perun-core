import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import style from './styles/DocumentManagerCreateForm.module.css'
import { GridManager, ComponentManager, alertUser, FormManager } from '../../elements';
import { svConfig } from '../../config';
import { store } from '../../model';



class DocManAddNewQuestion extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      formData: [],
      createdForm: [],
      formId: [],
      key: ''
    }
    this.createForm = this.createForm.bind(this)
    this.saveForm = this.saveForm.bind(this)
  }

  componentDidMount () {
    this.createForm('SVAROG_FORM_FIELD_TYPE')
  }

  /* create form with recieved paramId */
  createForm (currentForm) {
    let formId = currentForm
    let params = []
    params.push({
        'PARAM_NAME': 'formWeWant',
        'PARAM_VALUE': formId
      }, {
        'PARAM_NAME': 'object_id',
        'PARAM_VALUE': this.props.objId
      }, {
        'PARAM_NAME': 'parent_id',
        'PARAM_VALUE': '0'
      }, {
        'PARAM_NAME': 'session',
        'PARAM_VALUE': store.getState().security.svSession
      }, {
        'PARAM_NAME': 'table_name',
        'PARAM_VALUE': formId
      })
      let createdForm = FormManager.generateForm(formId , formId , params, 'formData', 'GET_FORM_BUILDER_MAVEN', 'GET_UISCHEMA_MAVEN', 'GET_DATA_FROM_FORM_MAVEN', null, this.saveForm, null, 'NEXT', 'form-container', `${style['button-affirmation']} ${style['button']}`, 'close', null)
      this.setState({createdForm: createdForm,  formId: formId})
  }

  /* save form */
  saveForm (e) {
  const component = this
  let restUrl
  let type
  let form_params
  restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.SAVE_FORM_DATA_2 + component.props.svSession + '/' + component.state.formId + '/' + component.props.objId  + '/' + null
  form_params = e.formData
  axios({
    method: 'post',
    data: form_params,
    url: restUrl,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(function (response) { 
    if (response.data) { 
      type = response.data.type
      type = type.toLowerCase()
      component.setState({ alert: alertUser(true, type, response.data.message, null, () => {
        (component.props.closeModal(response.data.data.objId))
        ComponentManager.setStateForComponent('SVAROG_FORM_FIELD_TYPE' + component.props.objId, null)
        GridManager.reloadGridData('SVAROG_FORM_FIELD_TYPE' + component.props.objId)
      }) })
    } 
  })
  .catch(function (response) {
      type = response.data.type
      type = type.toLowerCase()
      component.setState({ alert: alertUser(true, type, response.data.message, null, component.closeAlert) })
    })
  }

  render () {
    return (
      <React.Fragment>
        <div key={this.state.formId + this.state.key}>
          {this.state.createdForm}
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

export default connect(mapStateToProps)(DocManAddNewQuestion)