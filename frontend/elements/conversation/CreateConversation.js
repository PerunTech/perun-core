/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
import { svConfig, labelBasePath } from '../../config';
import { alertUser } from '..';
import styles from './ShowMsg.module.css';

const initialState = {
  showAlert: undefined,
  alertType: '',
  alertTitle: '',
  alertMessage: '',
  createConfigConv: null,
  attachments: {}
}

class CreateConversation extends React.Component {
  constructor (props) {
    super(props)
    this.state = initialState
  }

  componentDidMount () {
    let data
    const url = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.GET_CONVERSATION_HEADER + this.props.security.svSession + '/0'
    axios.get(url)
      .then((response) => {
        data = response.data.data || response.data
        if (data.fields.length > 0) {
          this.setState({ fields: data.fields })
          this.iterateConfConv(data)
        }
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  iterateConfConv (data) {
    let i
    let j
    let fields = data.fields
    let attachments = data.attachments
    let linkedFile
    let dropValues = []
    let fieldName
    let label
    let canEdit
    let htmlElement
    let type
    let options
    let configHtmlBuffer = []
    let htmlElementConv
    let htmlElementLabel

    for (i = 0; i < fields.length; i++) {
      fieldName = fields[i].fieldName
      label = fields[i].label
      canEdit = fields[i].canEdit
      type = fields[i].type
      let optionsHtmlBufffer = []
      /* if field has code list values create dropdown select f.r */
      if (type === 'dropdown') {
        dropValues = fields[i].values
        if (dropValues.length > 0) {
          for (j = 0; j < dropValues.length; j++) {
            options = <option key={label + j} value={dropValues[j].key}>{dropValues[j].value}</option>
            optionsHtmlBufffer.push(options)
          }
          if (canEdit) {
            htmlElementLabel = <label htmlFor={fieldName}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath + '.main.' + label}`,
                defaultMessage: `${labelBasePath + '.main.' + label}`
              })}*
            </label>
            htmlElementConv = <select id={fieldName} name={fieldName} onChange={this.onChange}>
              <option key={label} value='' selected disabled>
                {this.context.intl.formatMessage({
                  id: `${labelBasePath + '.main.' + label}`,
                  defaultMessage: `${labelBasePath + '.main.' + label}`
                })}
              </option>
              {optionsHtmlBufffer}</select>
          } else {
            htmlElementLabel = <label htmlFor={fieldName}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath + '.main.' + label}`,
                defaultMessage: `${labelBasePath + '.main.' + label}`
              })}
            </label>
            htmlElementConv = <select id={fieldName} name={fieldName} onChange={this.onChange} disabled>
              <option key={label} value='' selected disabled>
                {this.context.intl.formatMessage({
                  id: `${labelBasePath + '.main.' + label}`,
                  defaultMessage: `${labelBasePath + '.main.' + label}`
                })}
              </option>
              {optionsHtmlBufffer}</select>
          }
        }
      }

      if (type === 'string') {
        if (canEdit) {
          htmlElementLabel = <label htmlFor={fieldName}>
            {this.context.intl.formatMessage({
              id: `${labelBasePath + '.main.' + label}`,
              defaultMessage: `${labelBasePath + '.main.' + label}`
            })}
            {label === 'conversation.title' ? '*' : label === 'conversation.assigned_to_username' ? '*' : ' '}
          </label>
          htmlElementConv = <input id={fieldName} type='text' name={fieldName} onChange={this.onChange} />
        } else {
          htmlElementLabel = <label htmlFor={fieldName}>
            {this.context.intl.formatMessage({
              id: `${labelBasePath + '.main.' + label}`,
              defaultMessage: `${labelBasePath + '.main.' + label}`
            })}
          </label>
          htmlElementConv = <input id={fieldName} type='text' name={fieldName} onChange={this.onChange} disabled />
        }
      }
      configHtmlBuffer.push(htmlElementLabel, htmlElementConv)
    }

    let htmlHiddenElements = []
    if (attachments.length > 0) {
      let attachmentList = []
      let options
      htmlHiddenElements.push(
        <label htmlFor='attached'>
          {this.context.intl.formatMessage({
            id: `${labelBasePath}.msgs.choose_items_to_link`,
            defaultMessage: `${labelBasePath}.msgs.choose_items_to_link`
          })}
        </label>,
        <select id='attached' value='' onChange={this.generateInput} >
          <option key='default' value='' disabled>
            {this.context.intl.formatMessage({
              id: `${labelBasePath}.msgs.choose_linked_fields`,
              defaultMessage: `${labelBasePath}.msgs.choose_linked_fields`
            })}
          </option>{attachmentList}
        </select>
      )
      for (i = 0; i < attachments.length; i++) {
        linkedFile = attachments[i]
        options = <option key={linkedFile.key + i} value={linkedFile.tableName}>{linkedFile.label + '...'}</option>
        attachmentList.push(options)
        htmlElementConv = <div>
          <div id={linkedFile.tableName + '_prepend'} style={{ display: 'none', marginRight: '10px', width: 'calc(100% - 60% - 40px)' }}>
            <span className='input-group-text'>{linkedFile.tableName}</span>
          </div>
          <input
            id={linkedFile.tableName} key={linkedFile.key + i}
            name={linkedFile.label} onChange={this.onChange} type='text'
            style={{ display: 'none', width: '50%' }} className='form-control'
          />
          <input id={linkedFile.tableName + '_postpend'} type='button' value='+'
            style={{ display: 'none', marginTop: '0', minWidth: '40px' }}
          />
        </div>
        htmlHiddenElements.push(htmlElementConv)
      }
    }

    htmlElement = <fieldset id='createConv'>
      <div>
        <div className={styles.fieldsLeft}>
          {configHtmlBuffer}
        </div>
        <div className={styles.fieldsRight}>
          {htmlHiddenElements}
        </div>
      </div>
    </fieldset>

    if (this.props.onConvCreateClick instanceof Function) {
      this.props.onConvCreateClick(this, htmlElement, attachments)
    } else {
      this.setState({ createConfigConv: htmlElement, attachments: attachments })
    }
  }

  generateInput = (e) => {
    let valArray = e.target.value
    document.getElementById(valArray).style.display = 'inline-block'
    document.getElementById(`${valArray}_prepend`).style.display = 'inline-block'
    document.getElementById(`${valArray}_postpend`).style.display = 'inline-block'
  }


  onChange = (e) => {
    if (String(e.target.name).startsWith('attachedFile')) {
      let val = e.target.value
      let name = e.target.name
      let linkType = e.target.id
      name = name.replace('attachedFile', '')
      let nextAttachment = Object.assign({ ['link_type']: linkType }, { ['object_type']: name }, { ['value']: val })
      let nextTest = Object.assign(this.state.attachments, nextAttachment)
      this.setState({ attachments: nextTest })
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  resetForm = () => {
    let element = document.getElementById('createConv');
    for (let i = 0; i < element.childNodes.length; i++) {
      var e = element.childNodes[i];
      if (e.tagName) switch (e.tagName.toLowerCase()) {
        case 'input':
          switch (e.type) {
            case 'radio':
            case 'checkbox': e.checked = false; break;
            case 'button':
            case 'submit':
            case 'dropdown':
            case 'image': break;
            default: e.value = ''; break;
          }
          break;
        case 'fieldset': break;
        case 'select': e.selectedIndex = 0; break;
        case 'textarea': e.innerHTML = ''; break;
        default: clearChildren(e);
      }
    }
  }

  handleAlert = (response, text) => {
    response = response
    if (response.response) {
      response = response.response
    }
    let alertMessage = response.statusText
    let alertype = 'info'
    let alerttitle = ''

    if (response.data.message) {
      alertMessage = response.data.message
    } else {
      if (text) {
        alertMessage = text
      }
    }
    if (response.data.type) {
      alertype = response.data.type.toLowerCase()
    }
    if (response.data.title) {
      alerttitle = response.data.title
    }

    this.setState({
      showAlert: true,
      alertType: alertype,
      alertTitle: alerttitle,
      alertMessage: alertMessage
    })
  }

  handleConvActions = (event) => {
    event.preventDefault()
    const component = this
    const valueToSend = {
      attachments: []
    }
    this.state.fields.forEach((element) => {
      let id = document.getElementById(element.fieldName)
      let value = id.value
      if (value) {
        valueToSend[element.fieldName] = value
      }
    })
    if (this.state.attachments.length > 0) {
      this.state.attachments.forEach((element) => {
        let id = document.getElementById(element.tableName)
        if (id) {
          const obj = {
            OBJECT_ID: Number(id.value),
            OBJECT_TYPE: element.objectType,
            LINK_TYPE: element.key
          }
          id.value && valueToSend.attachments.push(obj)
        }
      })
    }
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CREATE_CONVERSATION
    axios({
      method: 'post',
      data: valueToSend,
      url: restUrl + this.props.security.svSession + '/0',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (response) {
      component.handleAlert(response, component.context.intl.formatMessage({
        id: `${labelBasePath + '.main.succesCreatedMsg'}`,
        defaultMessage: `${labelBasePath + '.main.succesCreatedMsg'}`
      }))
    }).catch(function (response) {
      component.handleAlert(response, component.context.intl.formatMessage({
        id: `${labelBasePath + '.main.errorCreatedMsg'}`,
        defaultMessage: `${labelBasePath + '.main.errorCreatedMsg'}`
      }))
    })
    this.resetForm()
  }

  render () {
    const { showAlert, alertType, alertTitle, alertMessage } = this.state
    return (
      <div id='createConvForm'>
        {
          showAlert && alertUser(
            showAlert,
            alertType,
            alertTitle,
            alertMessage,
            () => { this.setState({ showAlert: false, alertType: 'info' }) }
          )
        }
        {this.state.showAlert}
        <form onSubmit={this.handleConvActions}>
          {this.state.createConfigConv}
          <input type='submit' value='Create' />
          <input onClick={this.resetForm} type='button' value='Cancel' />
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    security: state.security
  }
}

CreateConversation.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(CreateConversation)
