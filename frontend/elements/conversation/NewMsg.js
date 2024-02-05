import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { svConfig, labelBasePath } from '../../config';
import msgStyle from './ShowMsg.module.css';

class NewMsg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showMsgss: true,
      showConv: this.props,
      conversationId: props.conversationId,
      MESSAGE_TEXT: '',
      parentId: props.parentId
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleConvActions(action) {
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CREATE_MSGS
    let msgContent = {
      MESSAGE_TEXT: this.state.MESSAGE_TEXT
    }
    switch (action) {
      case 'btnReply':
        axios({
          method: 'post',
          data: msgContent,
          url: restUrl + this.props.security.svSession + '/SVAROG_MESSAGE/' + this.state.parentId + '/0',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function () {
          console.log('success')
        }).catch(function () {
          console.log('error')
        })
        console.log('BtnReply')
        break
      case 'btnExport':
        alert('BTN EXPORT')
        console.log('BtnExport')
        break
      default:
    }
  }

  render() {
    return (
      <div>
        {this.state.showMsgss && <div id='msg_content' className={msgStyle.msgContent}>
          <textarea className={msgStyle.afterInput} name='MESSAGE_TEXT' id='MESSAGE_TEXT' onChange={this.onChange} rows='3' placeholder='Text...' required>{this.state.MESSAGE_TEXT}</textarea>
          <div id='newMsgBtnHolder' className={msgStyle.btnHolder}>
            <a onClick={() => { this.handleConvActions('btnReply') }} className={msgStyle.btnReply}>
              {this.context.intl.formatMessage({ id: `${labelBasePath}.main.saveNewMsg`, defaultMessage: `${labelBasePath}.main.saveEditConv` })}
            </a>
            <a onClick={this.props.onCancel} className={msgStyle.btnDelete}>
              {this.context.intl.formatMessage({ id: `${labelBasePath}.main.cancelNewMsg`, defaultMessage: `${labelBasePath}.main.cancelConv` })}
            </a>
          </div>
        </div>}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    security: state.security
  }
}

export default connect(mapStateToProps)(NewMsg)
