import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { store, saveFormData } from '../../../../model';
import { ComponentManager, FormManager, GridManager } from '../../..';

class GetDocumentsForParent extends React.Component {
  static propTypes = {
    formName: PropTypes.number.isRequired,
    parentId: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      showPopup: false,
      popUpForm: undefined,
      renderGrid: undefined
    }
    this.generateGrid = this.generateGrid.bind(this)
    this.generateForm = this.generateForm.bind(this)
    this.insertNewRow = this.insertNewRow.bind(this)
    this.editItemOnRowClick = this.editItemOnRowClick.bind(this)
  }

  UNSAFE_componentWillMount() {
    if (this.props.formName && this.props.parentId) {
      this.generateGrid(this.props)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.formName !== this.props.formName || nextProps.parentId !== this.props.parentId) {
      this.generateGrid(nextProps)
    }
  }

  generateGrid(props) {
    if (props) {
      const formName = props.formName
      const parentId = props.parentId
      const params = []
      params.push({
        PARAM_NAME: 'gridConfigWeWant',
        PARAM_VALUE: 'SVAROG_FORM'
      }, {
        PARAM_NAME: 'session',
        PARAM_VALUE: props.svSession
      }, {
        PARAM_NAME: 'parentId',
        PARAM_VALUE: props.parentId
      }, {
        PARAM_NAME: 'formName',
        PARAM_VALUE: props.formName
      }, {
        PARAM_NAME: 'recordNumber',
        PARAM_VALUE: 1000
      })
      const renderGrid = GridManager.generateGrid(
        `${formName}_${parentId}`, `${formName}_${parentId}`, 'CUSTOM_GRID',
        'GET_DOCUMENTS_BY_PARENTID', params, 'CUSTOM', this.editItemOnRowClick, this.insertNewRow
      )
      this.setState({ renderGrid })
      ComponentManager.setStateForComponent(
        `${formName}_${parentId}`, null,
        { onRowClickFunct: this.editItemOnRowClick, addRowSubgrid: this.insertNewRow }
      )
    }
  }

  generateForm(objectId, props) {
    if (this.state.showPopup === false) {
      this.setState({ showPopup: true })
    }
    const params = []
    const formWeWant = props.formName
    let formId = `${formWeWant}_FORM`
    params.push({
      PARAM_NAME: 'formWeWant',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'session',
      PARAM_VALUE: props.svSession
    }, {
      PARAM_NAME: 'table_name',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'parent_id',
      PARAM_VALUE: props.parentId
    })
    if (!objectId) {
      var popUpForm = FormManager.generateStructuredForm(
        formId, formId, params, 'formData',
        'GET_DOC_BUILDER', 'GET_DOC_UISCHEMA', 'GET_DOC_FORMDATA', this.closeWindow.bind(this), this.saveInputData.bind(this),
        null, null, null, null, 'structuredForm', this.onAlertClose.bind(this)
      )
    } else {
      params.push({
        PARAM_NAME: 'object_id',
        PARAM_VALUE: objectId
      })
      formId = `${formWeWant}_FORM_${objectId}`
      popUpForm = FormManager.generateStructuredForm(
        formId, formId, params, 'formData',
        'GET_DOC_BUILDER', 'GET_DOC_UISCHEMA', 'GET_DOC_FORMDATA', this.closeWindow.bind(this), this.editInputDataAndSave.bind(this),
        null, null, null, null, 'structuredForm', this.onAlertClose.bind(this)
      )
    }
    this.setState({ popUpForm })
  }

  closeWindow() {
    this.setState({ popUpForm: undefined, showPopup: false })
  }

  saveInputData(formData, session) {
    let datafields = formData.formData
    datafields = JSON.stringify(datafields)
    const params = []
    const formWeWant = this.props.formName
    params.push({
      PARAM_NAME: 'table_name',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'parentId',
      PARAM_VALUE: this.props.parentId
    }, {
      PARAM_NAME: 'json_string',
      PARAM_VALUE: datafields
    }, {
      PARAM_NAME: 'form_type',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'form_validation',
      PARAM_VALUE: 1
    }, {
      PARAM_NAME: 'value',
      PARAM_VALUE: 1
    })
    const activeForm = `${formWeWant}_FORM`
    saveFormData(activeForm, 'SAVE_DOCUMENT_OBJECT', session, params)
  }

  editInputDataAndSave(formData, session) {
    let datafields = formData.formData
    datafields = JSON.stringify(datafields)
    const params = []
    const formWeWant = this.props.formName
    params.push({
      PARAM_NAME: 'object_id',
      PARAM_VALUE: formData.formData.OBJECT_ID
    }, {
      PARAM_NAME: 'pkid',
      PARAM_VALUE: formData.formData.PKID
    }, {
      PARAM_NAME: 'table_name',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'parentId',
      PARAM_VALUE: this.props.parentId
    }, {
      PARAM_NAME: 'json_string',
      PARAM_VALUE: datafields
    }, {
      PARAM_NAME: 'form_type',
      PARAM_VALUE: formWeWant
    }, {
      PARAM_NAME: 'form_validation',
      PARAM_VALUE: 1
    }, {
      PARAM_NAME: 'value',
      PARAM_VALUE: 1
    })
    const activeForm = `${formWeWant}_FORM_${store.getState()[`${formWeWant}_${this.props.parentId}`].rowClicked['SVAROG_FORM.OBJECT_ID']}`
    saveFormData(activeForm, 'SAVE_DOCUMENT_OBJECT', session, params)
  }

  onAlertClose() {
    this.setState({ popUpForm: undefined, showPopup: false })
    GridManager.reloadGridData(`${this.props.formName}_${this.props.parentId}`)
  }

  insertNewRow() {
    this.generateForm(null, this.props)
  }

  editItemOnRowClick() {
    const objectId = store.getState()[`${this.props.formName}_${this.props.parentId}`].rowClicked['SVAROG_FORM.OBJECT_ID']
    this.generateForm(objectId, this.props)
  }

  render() {
    return (
      <div>
        {this.props.formName && this.props.parentId ? this.state.renderGrid : null}
        {this.state.showPopup &&
          <div id='form_modal' className='modal' style={{ display: 'block' }}>
            <div id='form_modal_content' className='modal-content'>
              <div className='modal-header'>
                <button id='modal_close_btn' type='button' className='close' onClick={this.closeWindow} data-dismiss='modal'>&times;</button>
              </div>
              <div id='form_modal_body' className='modal-body'>
                {this.state.popUpForm}
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})
export default connect(mapStateToProps)(GetDocumentsForParent)
