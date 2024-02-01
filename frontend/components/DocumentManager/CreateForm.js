import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import style from './styles/DocumentManagerCreateForm.module.css'
import PropTypes from 'prop-types'
import DocManEditQuestionsSectorGrid from './DocManEditQuestionsSectorGrid';
import Modal from '../Modal/Modal'
import { svConfig } from '../../config';
import { GridManager, ComponentManager, alertUser, FormManager, Dropdown } from '../../elements';
import { store, logoutUser } from '../../model';


class CreateForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      responseDataId: [],
      formData: [],
      createdForm: [],
      index: 0,
      formId: [],
      showNextBtn: false,
      dropDownOption: null,
      dropDownValue: '',
    }
    this.generateLastFormDropDown = this.generateLastFormDropDown.bind(this)
    this.createForm = this.createForm.bind(this)
    this.saveForm = this.saveForm.bind(this)
    this.callSecondForm = this.callSecondForm.bind(this)
    this.showModal = this.showModal.bind(this)
    this.onChange = this.onChange.bind(this)
    this.logout = this.logout.bind(this)
    this.closeAlert = this.closeAlert.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  componentDidMount () {
    // this.getMultiStepForms()
    this.createForm('SVAROG_FORM_TYPE')
  }

  /* generate last form dropdown */
  generateLastFormDropDown () {
    let type
    const url = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.GET_DROPDOWN_LAST_MULTISTEP + this.props.svSession + '/' + 'LABEL_CODE/' + 'SVAROG_TABLES/' + null + '/' + null + '/' + null
    axios.get(url)
      .then((response) => {
        let responseData = response.data.data
        let dropDownOption
        if (responseData) {
          dropDownOption = <Dropdown
            id='SVAROG_USER_GROUPS_DROPDOWN'
            name='SVAROG_USER_GROUPS_DROPDOWN'
            onChange={this.onChange}
            options={responseData}
          />
          }
          this.setState({dropDownOption: dropDownOption, formId: 'SVAROG_USER_GROUPS', createdForm: false, showNextBtn: false, showVerify: true, showGrid: false})
      })
      .catch((response) => {
        type = response.data.type
        type = type.toLowerCase()
        this.setState({ alert: alertUser(true, type, response.data.message, null, this.closeAlert) })
      })
    }

  /* create form with recieved paramId */
  createForm (currentForm) {
    // let objId = objId
    // if(!objId) {
    //   objId = '0'
    // }
    let formId = currentForm
    let params = []
    params.push({
        'PARAM_NAME': 'formWeWant',
        'PARAM_VALUE': formId
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
        'PARAM_VALUE': formId
      })
      let createdForm = FormManager.generateForm(formId , formId , params, 'formData', 'GET_FORM_BUILDER_MAVEN', 'GET_UISCHEMA_MAVEN', 'GET_DATA_FROM_FORM_MAVEN', null, this.saveForm, null, 'NEXT', 'form-container', `${style['button-affirmation']} ${style['button']}`, 'close', null)
      // this.setState({createdForm: createdForm,  formId: formId})
      if(formId !== 'SVAROG_FORM_FIELD_TYPE') {
        this.setState({createdForm: createdForm,  formId: formId})
      } else {
      this.setState({secondForm: createdForm, formId: formId})
    }
  }

  /* save form and depends on the formId make different urls and responses */
  saveForm (e) {
    const component = this
    let restUrl

    let form_params
    let type
    if (e.formData) {
      form_params = e.formData
    }
    
    if (component.state.formId == 'SVAROG_FORM_TYPE') {
      restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.SAVE_FORM_DATA_2 + component.props.svSession + '/' + component.state.formId + '/0/null'
      component.props.callBackChangeChildFormId(component.state.formId)
    } else if (component.state.formId == 'SVAROG_FORM_FIELD_TYPE') {
      restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.SAVE_FORM_DATA_2 + component.props.svSession + '/' + component.state.formId + '/' + component.state.object_id  + '/' + null
      component.props.callBackChangeChildFormId(component.state.formId)
    } else if (component.state.formId == 'SVAROG_USER_GROUPS') {
      if (e.currentTarget.id == 'verify') {
      restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.SAVE_FORM_DATA_2 + component.props.svSession + '/' +   'SVAROG_FORM_TYPE' + '/' + component.state.dropDownValue + '/null'
      form_params = component.state.data
      component.props.callBackChangeChildFormId(component.state.formId)
    }
  }

  axios({
    method: 'post',
    data: form_params,
    url: restUrl,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(function (response) {
    if (response.data) {
      type = response.data.type
      type = type.toLowerCase()
      /* stop the alert on every form save with this check fn */
      if (type != 'success') {
        component.setState({ alert: alertUser(true, type, response.data.message)})
      } else if (component.state.formId == 'SVAROG_USER_GROUPS' && type == 'success') {
        component.setState({ alert: alertUser(true, type, response.data.message)})
      } else if (component.state.formId == 'SVAROG_FORM_FIELD_TYPE') {
        component.setState({ alert: alertUser(true, type, 'Вашето прашање е внесено успешно, внесете ново прашање или продолжете кон следниот чекор')})
      }
      /* if current form is SVAROG_FORM_TYPE do save object_id from response */
      if (component.state.formId == 'SVAROG_FORM_TYPE') {
        component.setState({object_id: response.data.data.object_id, data: response.data.data, createdForm: []})
        component.setState({showGrid: true})
      } else
      if (component.state.formId == 'SVAROG_FORM_FIELD_TYPE') {
        component.setState({secondForm: [], showNextBtn: true})
        component.createForm('SVAROG_FORM_FIELD_TYPE')
        /* refresh grid based on this.state.object_id */
        ComponentManager.setStateForComponent('SVAROG_FORM_FIELD_TYPE' + component.state.object_id, null)
        GridManager.reloadGridData('SVAROG_FORM_FIELD_TYPE' + component.state.object_id)
      } else
      if (component.state.formId == 'SVAROG_USER_GROUPS') {
        component.setState({createdForm: [], showNextBtn: false, dropDownOption: false, showVerify: false})
      }
    } 
  })
  .catch(function (response) {
      type = response.data.type
      type = type.toLowerCase()
      component.setState({ alert: alertUser(true, type, response.data.message, null, component.closeAlert) })
    })
  }

  callSecondForm () {
    this.setState({showModal: false, }, () => this.showModal())
    this.createForm('SVAROG_FORM_FIELD_TYPE')
  }

  showModal () {
    this.setState({showModal: true})
  }

  /* change dropdown value */
  onChange (e) {
    if(e.target.id === 'SVAROG_USER_GROUPS_DROPDOWN') {
      this.setState({ dropDownValue : e.target.value })
    }
  }

  /* logout user if session is expired or error is shown */
  logout () {
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.svSession
    store.dispatch(logoutUser(restUrl))
  }

  closeAlert () {
    this.setState({ alert: alertUser(false, 'info', '') })
    this.logout()
  }

  closeModal () {
    this.setState({showModal: false})
  }

  render () {
    return (
      <React.Fragment>
        {this.state.showModal && <Modal 
          closeAction={this.closeModal}
          // submitAction={this.saveQuestion}
          closeModal={this.closeModal}
          modalContent={this.state.secondForm}
          modalTitle={this.context.intl.formatMessage({ id: 'perun.doc_manager.new.question', defaultMessage: 'perun.doc_manager.new.question' })}
          nameCloseBtn={this.context.intl.formatMessage({ id: 'perun.doc_manager.close', defaultMessage: 'perun.doc_manager.close' })}
          nameSubmitBtn={this.context.intl.formatMessage({ id: 'perun.doc_manager.finish', defaultMessage: 'perun.doc_manager.finish' })}
          />
        }
        <div className={`${style['flex-column']}`}>
          <div key={this.state.formId}>
            {this.state.showVerify && <p>{this.context.intl.formatMessage({ id: 'perun.doc_manager.choose.sector', defaultMessage: 'perun.doc_manager.choose.sector' })}</p>}
            {this.state.createdForm}
          </div>
        </div>
        <div className={`${style['flex-column']}`}>
          {this.state.dropDownOption}
          {this.state.showVerify && 
            <button id='verify' className={`${style['button']} ${style['button-grid']} ${style['button-position-right']}`} onClick={this.saveForm}>{this.context.intl.formatMessage({ id: 'perun.doc_manager.save.button', defaultMessage: 'perun.doc_manager.save.button' })}</button>
          }
          {(this.state.showGrid && this.state.object_id) ? <React.Fragment>
            <div className={`${style['flex-column']}`}>
              <div className={`${style['buttons-container']}`}>
                <button id='addNew' className={`${style['button']} ${style['button-grid']} ${style['button-custom-width']}`} onClick={this.callSecondForm}>{this.context.intl.formatMessage({ id: 'perun.doc_manager.add.question', defaultMessage: 'perun.doc_manager.add.question' })}</button>
                {this.state.showNextBtn && 
                  <button id='goToNext' className={`${style['button']} ${style['button-grid']} ${style['button-custom-width']}`} onClick={this.generateLastFormDropDown}>{this.context.intl.formatMessage({ id: 'perun.doc_manager.next.button', defaultMessage: 'perun.doc_manager.next.button' })}</button>
                }
              </div>
              <DocManEditQuestionsSectorGrid object_id={this.state.object_id} /> 
            </div>
          </React.Fragment> : console.log('error')}
          {/* {this.state.showNextBtn && 
            <button id='goToNext' className={`${style['button']} ${style['button-grid']} ${style['button-position']}`} onClick={this.generateLastFormDropDown}>{this.context.intl.formatMessage({ id: 'perun.doc_manager.next.button', defaultMessage: 'perun.doc_manager.next.button' })}</button>
          } */}
        </div>
      </React.Fragment>
    )
  }
}

CreateForm.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

export default connect(mapStateToProps)(CreateForm)