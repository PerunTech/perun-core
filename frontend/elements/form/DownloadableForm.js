import React from 'react';
import PropTypes from 'prop-types';
import { svConfig, labelBasePath } from '../../config';
import { saveFormDataWithFile } from '../../model';
import { ComponentManager, alertUser } from '..';
import StructuredForm from './StructuredForm';

export default class DownloadableForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ...this.props,
      alert: undefined
    }
    this.downloadFile = this.downloadFile.bind(this)
    this.saveFile = this.saveFile.bind(this)
    this.handleFileSelection = this.handleFileSelection.bind(this)
  }

  componentDidMount () {
    // this.props.refFunction(this)
  }

  componentDidUpdate () {
    // this.props.refFunction(this)
  }

  /* default downloadFile function f.r */
  downloadSingleFile (id, formName, session, fileId) {
    let verbPath = svConfig.triglavRestVerbs[formName]
    verbPath = verbPath.replace('%session', session)
    verbPath = verbPath.replace('%fileObjectId', fileId)
    const restUrl = svConfig.restSvcBaseUrl + verbPath
    window.open(restUrl, '_blank')
  }

  /* if parametar is function use that function
if not use default download file - function f.r */
  downloadFile (dataDoc) {
    const objectToGet = ComponentManager.getStateForComponent(this.props.id, 'formTableData')
    const session = ComponentManager.getStateForComponent(this.props.id, 'session')
    if (objectToGet.OBJECT_ID) { this.downloadSingleFile('DOWNLOAD', 'DOWNLOAD_FILE', session, objectToGet.OBJECT_ID) } else {
      this.setState({
        alert: alertUser(
          true, 'error',
          this.context.intl.formatMessage({ id: `${labelBasePath}.main.forms.document_does_not_exist`, defaultMessage: `${labelBasePath}.main.forms.document_does_not_exist` }),
          '', () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, '#3973ac'
        )
      })
    }
  }
  handleFileSelection (e) {
    // Item for upload was selected, set state to true
    // and call parent function which also sets the parent's stat
    e.preventDefault()
    const fileToUpload = e.target.files[0]
    // ComponentManager.setStateForComponent(id, 'file', fileToUpload)

    this.setState({ file: fileToUpload })
  }
  saveFile (formData, session) {
    if (this.state.file) {
      // hack to get the data directly from the dom element as setState causes rerender which removes all data currently in the form
      saveFormDataWithFile(this.props.id, 'SAVE_FILE', session, formData, this.state.file, this.props.params)
    } else {
      this.setState({
        alert: alertUser(
          true, 'error',
          this.context.intl.formatMessage({ id: `${labelBasePath}.main.forms.document_not_attached`, defaultMessage: `${labelBasePath}.main.forms.document_not_attached` }),
          '', () => this.setState({ alert: alertUser(false, 'info', ' ') }), undefined, false, undefined, undefined, false, '#3973ac'
        )
      })
    }
  }

  render () {
    const propsToSend = { ...this.props }
    delete propsToSend.addSaveFunction
    propsToSend.addSaveFunction = this.saveFile
    return (
      <div>
        {this.state.alert}
        <StructuredForm {...propsToSend} customElementClass='structuredForm' />
        <br />
        <button id='btn_download_doc' type='button' onClick={this.downloadFile} className='btn_save_form'>
          {this.context.intl.formatMessage({ id: `${labelBasePath}.main.forms.download`, defaultMessage: `${labelBasePath}.main.forms.download` })}
        </button>
        <br />
        <div className='form-group'>
          <input
            className='form-group'
            id='fileUpload'
            name='fileUpload'
            type='file'
            onChange={this.handleFileSelection}
          />
        </div>
      </div>
    )
  }
}

DownloadableForm.contextTypes = {
  intl: PropTypes.object.isRequired
}
