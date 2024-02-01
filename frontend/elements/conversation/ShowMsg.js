import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
import { svConfig, labelBasePath } from '../../config';
import { alertUser } from '..';
import Msgs from './Msgs';
import convStyle from './ShowMsg.module.css'

class ShowMsg extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showAlert: false,
      addNewMsg: null,
      showMsgs: null,
      showMsg: null,
      parentConversation: props.converType,
      convType: props.conversationType,
      editConv: false,
      convInfo: true,
      conversationData: '',
      PRIORITY: '',
      ASSIGNED_TO_USERNAME: '',
      showConversationDisplay: true
    }
  }

  getconversationData = () => {
    let conversationData = {
      PRIORITY: this.state.PRIORITY,
      ASSIGNED_TO_USERNAME: this.state.ASSIGNED_TO_USERNAME,
      OBJECT_ID: this.state.OBJECT_ID,
      PKID: this.state.PKID,
      TITLE: this.state.TITLE,
      MODULE_NAME: this.state.MODULE_NAME,
      CATEGORY: this.state.CATEGORY,
      ID: this.state.ID,
      OBJECT_TYPE: this.state.OBJECT_TYPE,
      CREATED_BY_USERNAME: this.state.CREATED_BY_USERNAME,
      CREATED_BY: this.state.CREATED_BY,
      STATUS: this.state.STATUS
    }
    return conversationData
  }

  componentDidMount () {
    let data
    const url = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.GET_CONVERSATION_DATA + this.props.security.svSession + '/' +
      this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.OBJECT_ID']
    axios.get(url)
      .then((response) => {
        data = response.data.data || response.data
        if (data.attachments.length > 0) {
          this.iterateConfConv(data)
        }
      })
      .catch((err) => {
        console.log(err)
      })

    this.setState({
      newMsg: <div key='new_msg' id='msg_content' className={convStyle.msgContent}>
        <textarea className={convStyle.afterInput} name='MESSAGE_TEXT' id='MESSAGE_TEXT' onChange={this.onChange} rows='3' placeholder='Text...' required>
          {this.state.MESSAGE_TEXT}
        </textarea>
        <div id='newMsgBtnHolder' className={convStyle.btnHolder}>
          <a onClick={() => { this.handleConvActions('btnSaveReply') }} className={convStyle.btnReply}>
            {this.context.intl.formatMessage({
              id: `${labelBasePath}.main.send_reply`,
              defaultMessage: `${labelBasePath}.main.send_reply`
            })}
          </a>
          <a onClick={() => { this.handleConvActions('btnCancelReply') }} className={convStyle.btnDelete}>
            {this.context.intl.formatMessage({
              id: `${labelBasePath}.main.cancelConv`,
              defaultMessage: `${labelBasePath}.main.cancelConv`
            })}
          </a>
        </div>
      </div>
    })

    const conversationId = this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.OBJECT_ID']
    this.setState({
      parentConv: this.state.parentConversation[this.state.convType].rowclicked,
      showMsgs: <Msgs key={conversationId} conversationId={conversationId} />,
      showMsg: <Msgs key={conversationId} conversationId={conversationId} />,
      PRIORITY: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.PRIORITY'],
      ASSIGNED_TO_USERNAME: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.ASSIGNED_TO_USERNAME'],
      OBJECT_ID: conversationId,
      PKID: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.PKID'],
      TITLE: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.TITLE'],
      MODULE_NAME: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.MODULE_NAME'],
      CATEGORY: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CATEGORY'],
      ID: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.ID'],
      OBJECT_TYPE: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.OBJECT_TYPE'],
      STATUS: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CONVERSATION_STATUS'],
      CREATED_BY: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CREATED_BY'],
      CREATED_BY_USERNAME: this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CREATED_BY_USERNAME']
    })
    console.log(this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CONVERSATION_STATUS'])
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  iterateConfConv (data) {
    let i
    let attachments = data.attachments
    let objectName
    let objectId
    let htmlElement
    let configHtmlBuffer = []
    let htmlElementConv

    for (i = 0; i < attachments.length; i++) {
      const att = attachments[i]
      const keys = Object.keys(att)
      for (let j = 0; j < keys.length; j++) {
        if (['objectId', 'objectName', 'objectPkid', 'objectType'].includes(keys[j])) {
          // do nothing
          continue
        } else {
          objectId = attachments[i].objectId
          objectName = `${keys[j]}: ${attachments[i][keys[j]]}`
          htmlElementConv = <a id={objectId}> {objectName} </a>
          configHtmlBuffer.push(htmlElementConv)
        }
      }
    }

    htmlElement = <div id='linked_objects' className={convStyle.linkedObjects}>{configHtmlBuffer}</div>

    this.setState({
      attachedFields: htmlElement,
      defaultConfigConv: htmlElement,
    })
  }

  handleConvActions = (action) => {
    const component = this
    switch (action) {
      case 'btnReply':
        this.setState(this.state)
        this.setState({ showMsg: [this.state.newMsg, this.state.showMsgs] })
        break
      case 'btnSaveReply':
        const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CREATE_MSGS
        let msgContent = {
          MESSAGE_TEXT: this.state.MESSAGE_TEXT
        }
        axios({
          method: 'post',
          data: msgContent,
          url: restUrl + this.props.security.svSession + '/SVAROG_MESSAGE/' + this.state.OBJECT_ID + '/0',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response) {
          component.setState({ showMsg: null },
            () => component.setState({ showMsg: component.state.showMsgs }))
          console.log('success')
        })
          .catch(function (response) {
            console.log('error')
          })
        break
      case 'btnCancelReply':
        this.setState({ showMsg: this.state.showMsgs })
        break
      case 'deleteConv':
        component.setState({
          showAlert: true,
          alertType: 'info',
          alertTitle:
            component.context.intl.formatMessage({
              id: `${labelBasePath}.msgs.confirm_msg_delete`,
              defaultMessage: `${labelBasePath}.msgs.confirm_msg_delete`
            }),
          alertMessage: `${this.state.ID}`,
          onConfirm: () => { this.editConversationInfo('delete') },
          onCancel: () => { this.handleConvActions('cancelSaveConv') }
        })
        console.log('BtnDelete')
        break
      case 'btnExport':
        console.log('BtnExport')
        break
      case 'editConv':
        this.setState({ convInfo: false, editConv: true })
        break
      case 'saveEditedConv':
        this.editConversationInfo('edit')
        this.setState({ convInfo: true, editConv: false })
        break
      case 'cancelSaveConv':
        this.setState({ editConv: false, convInfo: true })
        break
      default:
    }
  }

  // msgsActions () {

  // }

  handleAlert = (response, type, title, text, showCancelBtn, cancelBtnText) => {
    let alertMessage = response.statusText
    let alertType = 'info'
    let alertTitle = ''

    if (response.data.message) {
      alertMessage = response.data.message
    } else {
      if (text) {
        alertMessage = text
      }
    }

    if (response.data.type) {
      alertType = response.data.type.toLowerCase()
    } else {
      if (type) {
        alertType = type
      }
    }

    if (response.data.title) {
      alertTitle = response.data.title
    } else {
      if (title) {
        alertTitle = title
      }
    }

    if (cancelBtnText) {
      this.setState({
        cancelBtnText: this.context.intl.formatMessage({
          id: `${labelBasePath}.main.forms.cancel`,
          defaultMessage: `${labelBasePath}.main.forms.cancel`
        })
      })
    } else {
      this.setState({ cancelBtnText: ' ' })
    }

    this.setState({
      showAlert: true,
      alertType,
      alertTitle,
      alertMessage,
      onConfirm: () => this.setState({ showAlert: false, alertType: 'info' }),
      onCancel: () => this.setState({ showAlert: false, alertType: 'info' }),
      showCancelBtn,
      cancelBtnText
    })
  }

  editConversationInfo = (action) => {
    const component = this
    let restUrl
    switch (action) {
      case 'edit':
        restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CREATE_CONVERSATION
        console.log(restUrl)
        const valueToSend = this.getconversationData()
        axios({
          method: 'post',
          data: valueToSend,
          url: restUrl + this.props.security.svSession + '/0',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(response => {
          component.handleAlert(
            response,
            'success',
            this.context.intl.formatMessage({
              id: `${labelBasePath}.msgs.successfully_updated_info`,
              defaultMessage: `${labelBasePath}.msgs.successfully_updated_info`
            }),
            `${response.data['TITLE']}`,
          )
          // on successful save, write newly saved object in state
          component.setState({
            PRIORITY: response.data['PRIORITY'],
            ASSIGNED_TO_USERNAME: response.data['ASSIGNED_TO_USERNAME'],
            OBJECT_ID: response.data['object_id'],
            PKID: response.data['pkid'],
            TITLE: response.data['TITLE'],
            MODULE_NAME: response.data['MODULE_NAME'],
            CATEGORY: response.data['CATEGORY'],
            ID: response.data['ID'],
            OBJECT_TYPE: response.data['object_type'],
            STATUS: response.data['status'],
            CREATED_BY: response.data['CREATED_BY'],
            CREATED_BY_USERNAME: response.data['CREATED_BY_USERNAME']
          })
        })
          .catch(err => {
            component.handleAlert(
              err,
              'error',
              this.context.intl.formatMessage({
                id: `${labelBasePath}.msgs.unsuccessfully_updated_info`,
                defaultMessage: `${labelBasePath}.msgs.unsuccessfully_updated_info`
              }),
              `${err.statusText}`,
            )
          })
        break
      case 'delete':
        restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.DELETE_CONVERSATION_MSGS
        this.setState({ addNewMsg: null })
        axios({
          method: 'post',
          data: '',
          url: restUrl + this.props.security.svSession + '/' + this.state.OBJECT_ID + '/' + this.state.OBJECT_TYPE + '/' + this.state.PKID,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(response => {
          component.handleAlert(
            response,
            'success',
            `The message with id ${this.state.ID} has been successfully deleted`,
            ' '
          )
          component.setState({ showMsg: false })
        })
          .catch(function (response) {
            component.handleAlert(response)
          })
        this.setState({ showConversationDisplay: false })
        break
      default:
    }
  }

  render () {
    const { PRIORITY, ASSIGNED_TO_USERNAME } = this.state
    const { showAlert, alertType, alertTitle, alertMessage, onConfirm, onCancel, showCancelBtn, cancelBtnText } = this.state
    return (
      <div>
        {
          showAlert && alertUser(
            showAlert,
            alertType,
            alertTitle,
            alertMessage,
            onConfirm,
            onCancel,
            showCancelBtn,
            cancelBtnText
          )
        }
        {this.state.showConversationDisplay && <div id='conversation_header' className={convStyle.conversationHeader}>
          {this.state.convInfo && <div>
            <a>
              {/* Created By: */}
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.createdBy`,
                defaultMessage: `${labelBasePath}.main.createdBy`
              })}
              {this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CREATED_BY_USERNAME']}
            </a>
            <br />
            <a>
              {/* Conversation ID: # */}
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.conversationId`,
                defaultMessage: `${labelBasePath}.main.conversationId`
              })}
              {this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.ID']}
            </a>
            <br />
            <a>
              {/* Priority: */}
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.priorityConv`,
                defaultMessage: `${labelBasePath}.main.priorityConv`
              })}
              {PRIORITY}
            </a>
            <br />
            <a>
              {/* Status: */}
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.statusConv`,
                defaultMessage: `${labelBasePath}.main.statusConv`
              })}
              {this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CONVERSATION_STATUS']}
            </a>
            <br />
            <a>
              {/* Assigned To: */}
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.assignedTo`,
                defaultMessage: `${labelBasePath}.main.assignedTo`
              })}
              {ASSIGNED_TO_USERNAME}
            </a>
            <a id='editConv' onClick={() => { this.handleConvActions('editConv') }} className={convStyle.btnEditConv}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.editConv`,
                defaultMessage: `${labelBasePath}.main.editConv`
              })}
            </a>
          </div>}
          {this.state.editConv && <div>
            <a>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.createdBy`,
                defaultMessage: `${labelBasePath}.main.createdBy`
              })}
              {this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CREATED_BY_USERNAME']}</a>
            <br />
            <a>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.conversationId`,
                defaultMessage: `${labelBasePath}.main.conversationId`
              })}
              {this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.ID']}</a>
            <br />
            <a>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.priorityConv`,
                defaultMessage: `${labelBasePath}.main.priorityConv`
              })}
            </a>
            <select className={convStyle.selectEditDropdown} id='priority' name='PRIORITY' value={PRIORITY} onChange={this.onChange} >
              <option value='0' selected disabled>
                {this.context.intl.formatMessage({
                  id: `${labelBasePath}.main.priorityConv`,
                  defaultMessage: `${labelBasePath}.main.priorityConv`
                })}
              </option>
              <option value='LOW'>
                {this.context.intl.formatMessage({
                  id: `${labelBasePath}.conv_priority_low`,
                  defaultMessage: `${labelBasePath}.conv_priority_low`
                })}
              </option>
              <option value='NORMAL'>
                {this.context.intl.formatMessage({
                  id: `${labelBasePath}.conv_priority_normal`,
                  defaultMessage: `${labelBasePath}.conv_priority_normal`
                })}
              </option>
              <option value='HIGH'>
                {this.context.intl.formatMessage({
                  id: `${labelBasePath}.conv_priority_high`,
                  defaultMessage: `${labelBasePath}.conv_priority_high`
                })}
              </option>
              <option value='IMMEDIATE'>
                {this.context.intl.formatMessage({
                  id: `${labelBasePath}.conv_priority_immediate`,
                  defaultMessage: `${labelBasePath}.conv_priority_immediate`
                })}
              </option>
            </select>
            <br />
            <a>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.statusConv`,
                defaultMessage: `${labelBasePath}.main.statusConv`
              })}
              {this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.CONVERSATION_STATUS']}
            </a>
            <br />
            <a>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.assignedTo`,
                defaultMessage: `${labelBasePath}.main.assignedTo`
              })}
            </a>
            <input
              className={convStyle.editAssignedUser}
              onChange={this.onChange}
              name='ASSIGNED_TO_USERNAME'
              value={ASSIGNED_TO_USERNAME}
              placeholder={this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.ASSIGNED_TO_USERNAME']}
            />
            <a id='cancelEdit' onClick={() => { this.handleConvActions('cancelSaveConv') }} className={convStyle.btnSaveEditConv}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.cancelConv`,
                defaultMessage: `${labelBasePath}.main.cancelConv`
              })}
            </a>
            <a id='saveEdit' onClick={() => { this.handleConvActions('saveEditedConv') }} className={convStyle.btnSaveEditConv}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.saveEditConv`,
                defaultMessage: `${labelBasePath}.main.saveEditConv`
              })}
            </a>
          </div>}
          {/* <div id='holderConvMsg' className={msgStyle.holderConvMsg}> */}
          <div id='conversation_title' className={convStyle.conversationTitle}>
            <a>
              {this.state.parentConversation[this.state.convType].rowClicked['SVAROG_CONVERSATION.TITLE']}
            </a>
          </div>
          {this.state.attachedFields}
          <div id='msg_content' className={convStyle.msgHolder}>
            {this.state.showMsg}
            {/* {this.state.addNewMsg && <div id='msg_content' className={convStyle.msgContent}>
              <textarea className={convStyle.afterInput} name='MESSAGE_TEXT' id='MESSAGE_TEXT' onChange={this.onChange} rows='3' placeholder='Text...' required>{this.state.MESSAGE_TEXT}</textarea>
              <div id='btnHolder' className={convStyle.btnHolder}>
                <a onClick={() => { this.handleConvActions('btnSaveReply') }} className={convStyle.btnReply}>Save</a>
                <a onClick={this.props.onCancel} className={convStyle.btnDelete}>Cancel</a>
              </div>
          </div>} */}
          </div>
          <div id='btnHolder' className={convStyle.btnHolder}>
            <a onClick={() => { this.handleConvActions('btnReply') }} className={convStyle.btnReply}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.replyBtn`,
                defaultMessage: `${labelBasePath}.main.replyBtn`
              })}
            </a>
            <a onClick={() => { this.handleConvActions('deleteConv') }} className={convStyle.btnDelete}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.deleteBtn`,
                defaultMessage: `${labelBasePath}.main.deleteBtn`
              })}
            </a>
            <a onClick={() => { this.handleConvActions('btnExport') }} className={convStyle.btnExport}>
              {this.context.intl.formatMessage({
                id: `${labelBasePath}.main.exportBtn`,
                defaultMessage: `${labelBasePath}.main.exportBtn`
              })}
            </a>
          </div>
          {/* </div> */}
        </div>}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    security: state.security,
    converType: state
  }
}

ShowMsg.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ShowMsg)
