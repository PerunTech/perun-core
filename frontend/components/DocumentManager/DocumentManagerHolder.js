import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import style from './styles/DocumentManager.module.css'
import DocManSearchByParamGrid from './DocManSearchByParamGrid';
import DocManEditQuestionsSectorGrid from './DocManEditQuestionsSectorGrid';
import CreateForm from './CreateForm';
import Modal from '../Modal/Modal'
import DocManAddNewQuestion from './DocManAddNewQuestion';
import { iconManager } from '../../assets/svg/svgHolder'
import PropTypes from 'prop-types'
import { svConfig } from '../../config';
import { GridManager, ComponentManager, alertUser, InputElement, Dropdown } from '../../elements';
import { store, logoutUser } from '../../model';

class DocumentManager extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dropDownOption: [],
      showGridBySearchParam: false,
      showCreateGrid: false,
      filterName: '',
      filterValue: '',
      showEditBtn: false,
      showEditQuestions: false,
      statusValue: '',
      objId: '',
      showEditQuestionsGrid: false,
      currentButtonId: '',
      formId: '',
      showModal: false,
      showAddNewQuestion: false,
      childObjId: '',
      objType: '',
      showDelete: false,
      showDeleteQuestions: false,
      questionObjId: '',
      questionObjType: '',
      labelCode: '',
      questionLabelCode: ''
    }
    this.getSearchResults = this.getSearchResults.bind(this)
    this.handleDropDownSearchOptions = this.handleDropDownSearchOptions.bind(this)
    this.onChange = this.onChange.bind(this)
    this.searchBy = this.searchBy.bind(this)
    this.showGridBySearchParam = this.showGridBySearchParam.bind(this)
    this.createDocument = this.createDocument.bind(this)
    this.changeFormIdCallback = this.changeFormIdCallback.bind(this)
    this.onRowClick = this.onRowClick.bind(this)
    this.onQuestionClick = this.onQuestionClick.bind(this)
    this.editDocument = this.editDocument.bind(this)
    this.docQuestionsSector = this.docQuestionsSector.bind(this)
    this.showEditGrid = this.showEditGrid.bind(this)
    this.logout = this.logout.bind(this)
    this.closeAlert = this.closeAlert.bind(this)
    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.deleteDocument = this.deleteDocument.bind(this)
    this.deleteQuestion = this.deleteQuestion.bind(this)
    this.changeDocStatus = this.changeDocStatus.bind(this)
  }

  componentDidMount() {
    this.getSearchResults()
    // objid e staveno na '' ako se pretisne prebaraj i kreiraj nov dokument ?
  }

  /* axios get search results for initial dropdown */
  getSearchResults() {
    let type
    const url = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.GET_SEARCH_OPTIONS + this.props.svSession + '/DOC_SEARCH_FILTERS/null/null'
    axios.get(url)
      .then((response) => {
        if (response.data) {
          this.handleDropDownSearchOptions(response.data)
        }
      })
      .catch((response) => {
        type = response.data.type
        type = type.toLowerCase()
        this.setState({ alert: alertUser(true, type, response.data.message, null, this.closeAlert) })
      })
  }

  /* Iterate dropdown search values, create option in dropdown to be selected */
  handleDropDownSearchOptions(responseData) {
    let dropDownOption
    let dropDownOptionArr = []
    if (responseData) {
      dropDownOption = <Dropdown
        id='documentDropdown'
        name='documentDropdown'
        onChange={this.onChange}
        options={responseData}
      />
    }
    dropDownOptionArr.push(dropDownOption)
    this.setState({ dropDownOption: dropDownOptionArr })
  }

  /* change dropdown/input value depends on the selected target/entered value */
  onChange(e) {
    if (e.currentTarget.id === 'documentDropdown') {
      this.setState({ filterName: e.target.value })
      // if(e.target.value === '0') {
      //     return (
      //    setState({changeblefield:}) <input type="text"/>
      //     )
      // } else if (e.target.value === '1') {
      //   return (
      //     <select name="" id=""></select>
      //   )
      // } else if (e.target.value === '2') {
      //   <select name="" id=""></select>
      // }
      // going to need this for the first dropdown value to change the search input form
    } else if (e.target.name === 'searchBy') {
      this.setState({ filterValue: e.target.value })
    } else {
      console.log('shouldnt go here')
    }
  }

  /* set search params and show grid depending on the params with grid refresh fn*/
  searchBy() {
    this.setState({ showGridBySearchParam: false, showCreateGrid: false, uniqueKey: this.state.filterName, showEditBtn: false, showEditQuestions: false, showEditQuestionsGrid: false, showAddNewQuestion: false, showDeleteQuestions: false, labelCode: '', questionLabelCode: '' }, () => this.showGridBySearchParam())
  }

  /* triggers search-grid reload */
  showGridBySearchParam() {
    ComponentManager.setStateForComponent('SVAROG_FORM_TYPE' + this.state.filterName + this.state.filterValue + this.state.objId, 'rowClicked', [])
    ComponentManager.setStateForComponent('SVAROG_FORM_TYPE' + this.state.filterName + this.state.filterValue + this.state.objId, null)
    GridManager.reloadGridData('SVAROG_FORM_TYPE' + this.state.filterName + this.state.filterValue + this.state.objId)
    this.setState({ showGridBySearchParam: true })
  }

  /* create new document fn */
  createDocument() {
    let documentManagerCreateForm = <div key={this.state.formId + this.state.objId}>
      <CreateForm callBackChangeChildFormId={this.changeFormIdCallback} />
    </div>
    this.setState({ showGridBySearchParam: false, showEditBtn: false, showEditQuestions: false, showEditQuestionsGrid: false, showCreateGrid: documentManagerCreateForm, showAddNewQuestion: false, showDelete: false, objId: '', showDeleteQuestions: false, questionLabelCode: '', labelCode: '' })
  }

  /* refresh form id if it is clicked again on create document button after finishing with wizzards form last step */
  changeFormIdCallback(formId) {
    this.setState({ formId: formId })
  }

  /* on row click function recieve params from documentmanagerGrid */
  onRowClick(statusValue, objId, objType, labelCode) {
    this.setState({ showEditBtn: true, statusValue: statusValue, objId: objId, objType: objType, labelCode: labelCode })
  }

  onQuestionClick(questionObjId, questionObjType, questionLabelCode) {
    this.setState({ questionObjId: questionObjId, questionObjType: questionObjType, questionLabelCode: questionLabelCode })
  }

  /* change state editDoc */
  editDocument() {
    this.setState({ showEditQuestions: !this.state.showEditQuestions, showCreateGrid: false, showAddNewQuestion: false, showDelete: !this.state.showDelete })
  }

  /* if docQuestionsSector is clicked send other props to DocManEditQuestionsSectorGrid */
  docQuestionsSector(e) {
    this.setState({ showEditQuestionsGrid: true, showGridBySearchParam: false, showCreateGrid: false, showEditBtn: false, showAddNewQuestion: true, showDelete: false, showDeleteQuestions: true })
    if (e.target.id === 'docQuestions') {
      this.setState({ currentButtonId: e.target.id, showEditQuestionsGrid: false, showAddNewQuestion: true }, () => this.showEditGrid())
    }
  }

  /* hack fn, refresh the correct grid, first hide the grid: showEditQuestionsGrid:false than in callback trigger this fn to show the grid again */
  showEditGrid() {
    this.setState({ showEditQuestionsGrid: true })
  }

  /* logout user if session is expired or error is shown */
  logout() {
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.svSession
    store.dispatch(logoutUser(restUrl))
  }

  closeAlert() {
    this.setState({ alert: alertUser(false, 'info', '') })
    this.logout()
  }

  showModal() {
    this.setState({ showModal: true, questionLabelCode: '' })
  }

  /* when added a new question in the modal check if there is a new value for childId set it to state and change grid key to trigger rerender */
  closeModal(childObjId) {
    this.setState({ showModal: false })
    if (childObjId) {
      this.setState({ showEditQuestionsGrid: false, childObjId: childObjId }, () => this.showEditGrid())
    }
  }

  /* axios delete document with selected objId */
  deleteDocument() {
    const component = this
    component.setState({ questionLabelCode: '' })
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.DELETE_DOCUMENT
    let data_params
    let type
    if (component.state.objId && component.state.objType) {
      data_params = { 'objectId': component.state.objId, 'objectTypeId': component.state.objType }
    }
    axios({
      method: 'post',
      data: data_params,
      url: restUrl + this.props.svSession,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (response) {
      if (response.data) {
        type = response.data.type
        type = type.toLowerCase()
        component.setState({ alert: alertUser(true, type, response.data.message, null, component.showGridBySearchParam), showGridBySearchParam: false }, () => component.setState({ labelCode: '' }))
      }
    }).catch(function (response) {
      type = response.data.type
      type = type.toLowerCase()
      component.setState({ alert: alertUser(true, type, response.response.data.message, null, component.closeAlert) })
    })
  }

  /* axios delete document questions with selected childObjId */
  deleteQuestion() {
    const component = this
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.DELETE_DOCUMENT
    let data_params
    let type
    component.setState({ questionLabelCode: '' })
    if (component.state.questionObjId && component.state.questionObjType) {
      data_params = { 'objectId': component.state.questionObjId, 'objectTypeId': component.state.questionObjType }
    }
    axios({
      method: 'post',
      data: data_params,
      url: restUrl + this.props.svSession,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (response) {
      if (response.data) {
        type = response.data.type
        type = type.toLowerCase()
        component.setState({
          alert: alertUser(true, type, response.data.message, null, () => {
            // component.showEditGrid
            ComponentManager.setStateForComponent('SVAROG_FORM_FIELD_TYPE' + component.state.objId, null)
            GridManager.reloadGridData('SVAROG_FORM_FIELD_TYPE' + component.state.objId)
            ComponentManager.setStateForComponent('SVAROG_FORM_FIELD_TYPE' + component.state.objId, 'rowClicked', [])
          })
          // , showEditQuestionsGrid: false
        })
      }
    }).catch(function (response) {
      type = response.data.type
      type = type.toLowerCase()
      component.setState({ alert: alertUser(true, type, response.response.data.message, null, component.closeAlert) })
    })
  }

  /* change document status to inactive */
  changeDocStatus = () => {
    const component = this
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.DOCUMENT_CHANGE_STATUS
    let data_params
    let type
    if (component.state.objId && component.state.objType) {
      data_params = { 'objectId': component.state.objId, 'objectTypeId': component.state.objType, 'status': component.state.statusValue == 'VALID' ? 'INVALID' : 'VALID' }
    }
    axios({
      method: 'post',
      data: data_params,
      url: restUrl + this.props.svSession,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (response) {
      if (response.data) {
        type = response.data.type
        type = type.toLowerCase()
        component.setState({ alert: alertUser(true, type, response.data.message, null, component.showGridBySearchParam), showGridBySearchParam: false })
      }
    }).catch(function (response) {
      type = response.data.type
      type = type.toLowerCase()
      component.setState({ alert: alertUser(true, type, response.response.data.message, null, component.closeAlert) })
    })
  }

  render() {
    const { uniqueKey, dropDownOption, showGridBySearchParam, showCreateGrid, showEditBtn, showEditQuestions, showEditQuestionsGrid, showModal, showAddNewQuestion, showDelete, showDeleteQuestions } = this.state
    return (
      <React.Fragment>
        {showModal && <Modal
          closeAction={this.closeModal}
          // submitAction={this.saveQuestion}
          closeModal={this.closeModal}
          modalContent={<DocManAddNewQuestion
            objId={this.state.objId}
            closeModal={this.closeModal}
            objectIdPropToDocManAdd={this.state.objectIdProp}
          // should recieve object_id from docmanaddnewquestion and do the if logic
          />}
          modalTitle={this.context.intl.formatMessage({ id: 'perun.doc_manager.new.question', defaultMessage: 'perun.doc_manager.new.question' })}
          nameCloseBtn={this.context.intl.formatMessage({ id: 'perun.doc_manager.close', defaultMessage: 'perun.doc_manager.close' })}
          nameSubmitBtn={this.context.intl.formatMessage({ id: 'perun.doc_manager.finish', defaultMessage: 'perun.doc_manager.finish' })}
        />}
        <div className={`${style['app-body']}`}>
          <div className={`${style['flex-parent']} ${style['parent-margin']}`}>
            <div className={`${style['flex-icon-back']}`} onClick={this.props.history.goBack}>
              <div className={`${style['single-icon']}`}>
                {iconManager.getIcon('chevronLeft')}
              </div>
              <span className={`${style['icon-text']}`}>
                {this.context.intl.formatMessage({ id: 'perun.admin_console.back_button', defaultMessage: 'perun.admin_console.back_button' })}
              </span>
            </div>
          </div>
          <div className={`${style['flex-parent']} ${style['parent-margin']}`}>
            <div className={`${style['flex-side-child']}`}>
              <div className={`${style['custom-form-container']} ${style['animation-top']}`}>
                <div className={`${style['description-for']}`}>
                  {this.context.intl.formatMessage({ id: 'perun.doc_manager.info.panel', defaultMessage: 'perun.doc_manager.info.panel' })}
                </div>
                {this.state.labelCode ? <p>{this.context.intl.formatMessage({ id: 'perun.doc_manager.select.actions', defaultMessage: 'perun.doc_manager.select.actions' })} <span className={`${style['highlighted-text']}`}>{this.state.labelCode}</span></p> : <p>{this.context.intl.formatMessage({ id: 'perun.doc_manager.document.action', defaultMessage: 'perun.doc_manager.document.action' })}</p>}
                {this.state.questionLabelCode ? <p>{this.context.intl.formatMessage({ id: 'perun.doc_manager.question.selected', defaultMessage: 'perun.doc_manager.question.selected' })} <span className={`${style['highlighted-text']}`}>{this.state.questionLabelCode} </span></p> : null}
              </div>
              <div className={`${style['custom-form-container']} ${style['animation-top']} ${style['flex-column']}`}>
                <div className={`${style['description-for']}`}>
                  {this.context.intl.formatMessage({ id: 'perun.doc_manager.search.panel', defaultMessage: 'perun.doc_manager.search.panel' })}
                </div>
                {dropDownOption}
                <div className={`${style['flex-column']}`}>
                  <InputElement name='searchBy' onChange={this.onChange} />
                  <button disabled={this.state.filterName == '' && this.state.filterValue == ''} className={`${style['button']} ${style['button-create']}`} onClick={this.searchBy} >
                    {!this.state.showEditQuestionsGrid ? this.context.intl.formatMessage({ id: 'perun.doc_manager.search', defaultMessage: 'perun.doc_manager.search' }) : this.context.intl.formatMessage({ id: 'perun.doc_manager.back.to.doc.preview', defaultMessage: 'perun.doc_manager.back.to.doc.preview' })}
                  </button>
                </div>
              </div>
              <div className={`${style['custom-form-container']} ${style['animation-top']}`}>
                <div className={`${style['description-for']}`}>{this.context.intl.formatMessage({ id: 'perun.doc_manager.actions.panel', defaultMessage: 'perun.doc_manager.actions.panel' })}</div>
                <div className={`${style['flex-end']}`}>
                  <button className={`${style['side-nav-el']}`} onClick={this.createDocument} id='createDoc' >
                    <div className={`${style['button-flex']}`}>
                      <span>{this.context.intl.formatMessage({ id: 'perun.doc_manager.create.new.document', defaultMessage: 'perun.doc_manager.create.new.document' })}</span>
                      <div className={`${style['icon']}`}>
                        {iconManager.getIcon('plus_folder')}
                      </div>
                    </div>
                  </button>
                  {showEditBtn && <React.Fragment>
                    <button className={`${style['side-nav-el']}`} onClick={this.editDocument} >
                      <div className={`${style['button-flex']}`}>
                        <span>{this.context.intl.formatMessage({ id: 'perun.doc_manager.select.actions', defaultMessage: 'perun.doc_manager.select.actions' })}</span>
                        <div className={`${style['icon']}`}>
                          {iconManager.getIcon('arrow_down')}
                        </div>
                      </div>
                    </button>
                  </React.Fragment>}
                  {showDelete && <React.Fragment>
                    <button className={`${style['side-nav-el']} ${style['sub-nav-el']}`} onClick={this.deleteDocument}>
                      <div className={`${style['button-flex']}`}>
                        <span>{this.context.intl.formatMessage({ id: 'perun.doc_manager.delete.document', defaultMessage: 'perun.doc_manager.delete.document' })}</span>
                        <div className={`${style['icon']}`}>
                          {iconManager.getIcon('delete')}
                        </div>
                      </div>
                    </button>
                    <button className={`${style['side-nav-el']} ${style['sub-nav-el']}`} onClick={this.changeDocStatus}>
                      <div className={`${style['button-flex']}`}>
                        <span>{this.context.intl.formatMessage({ id: 'perun.doc_manager.change.status', defaultMessage: 'perun.doc_manager.change.status' })}</span>
                        <div className={`${style['icon']}`}>
                          {iconManager.getIcon('change')}
                        </div>
                      </div>
                    </button>
                    {/* <button className={`${style['side-nav-el']} ${style['sub-nav-el']}`} onClick={this.advancedEdit}>
                      <div className={`${style['button-flex']}`}>
                        <span>Advanced edit</span>
                        <span><Edit /></span>
                      </div>
                    </button> */}
                  </React.Fragment>}
                </div>
                {showEditQuestions && <React.Fragment>
                  <button className={`${style['side-nav-el']}`} onClick={this.docQuestionsSector} id='docQuestions'>
                    <div className={`${style['button-flex']}`}>
                      <span>{this.context.intl.formatMessage({ id: 'perun.doc_manager.document.questions', defaultMessage: 'perun.doc_manager.document.questions' })}</span>
                      <div className={`${style['icon']}`}>
                        {iconManager.getIcon('question_mark')}
                      </div>
                    </div>
                  </button>
                </React.Fragment>}
                <div className={`${style['flex-end']}`}>
                  {showAddNewQuestion && <React.Fragment>
                    <button className={`${style['side-nav-el']} ${style['sub-nav-el']}`} onClick={this.showModal} id='addQuestion'>
                      <div className={`${style['button-flex']}`}>
                        <span>{this.context.intl.formatMessage({ id: 'perun.doc_manager.add.question', defaultMessage: 'perun.doc_manager.add.question' })}</span>
                        <div className={`${style['icon']}`}>
                          {iconManager.getIcon('plus')}
                        </div>
                      </div>
                    </button>
                  </React.Fragment>}
                  {showDeleteQuestions && <React.Fragment>
                    <button className={`${style['side-nav-el']} ${style['sub-nav-el']}`} onClick={this.deleteQuestion}>
                      <div className={`${style['button-flex']}`}>
                        <span>{this.context.intl.formatMessage({ id: 'perun.doc_manager.delete.question', defaultMessage: 'perun.doc_manager.delete.question' })}</span>
                        <div className={`${style['icon']}`}>
                          {iconManager.getIcon('delete')}
                        </div>
                      </div>
                    </button>
                  </React.Fragment>}
                </div>
              </div>
            </div>
            <div className={`${style['flex-table-child']}`}>
              {showGridBySearchParam && <React.Fragment>
                <DocManSearchByParamGrid key={uniqueKey}
                  filterName={this.state.filterName}
                  filterValue={this.state.filterValue}
                  onRowClick={this.onRowClick}
                  objId={this.state.objId}
                />
              </React.Fragment>}
              {showCreateGrid}
              {showEditQuestionsGrid && <React.Fragment>
                <DocManEditQuestionsSectorGrid
                  objId={this.state.objId}
                  childObjId={this.state.childObjId}
                  currentButtonId={this.state.currentButtonId}
                  onQuestionClick={this.onQuestionClick}
                />
              </React.Fragment>}
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

DocumentManager.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(DocumentManager)
