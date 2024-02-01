import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { svConfig } from '../../config';
import msgStyle from './ShowMsg.module.css';

class Msgs extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      deleteObj: '',
      addNewMsg: false,
      showConv: this.props,
      conversationId: props.conversationId,
      msgs: null,
      response: ''
    }
    this.iterateMsgs = this.iterateMsgs.bind(this)
    this.initMsgData = this.iterateMsgs.bind(this)
    this.handleConvActions = this.handleConvActions.bind(this)
  }

  componentDidMount () {
    let data
    const url = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.GET_MESSAGES + this.props.security.svSession + '/' + this.state.conversationId
    axios.get(url)
      .then((response) => {
        data = response.data.data || response.data
        if (data.length > 0) {
          this.iterateMsgs(data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  iterateMsgs (data) {
    // let objects
    // let reply
    // let deleteB
    let htmlElement
    let msgsBuffer = []
    for (let i = 0; i < data.length; i++) {
      /* objects = data[i]
      if (data[i].canReply) {
        reply = <a onClick={() => { this.handleConvActions('btnReplay') }} className={msgStyle.btnReplyMsg}>Reply</a>
      }
      if (data[i].canDelete) {
        deleteB = <a onClick={() => { this.handleConvActions('btnDelete', objects['MESSAGE.OBJECT_ID']) }} className={msgStyle.btnDeleteMsg}>Delete + {objects['MESSAGE.OBJECT_ID']} </a>
      } */
      if (data[i].level === 1) {
        htmlElement = <div key={data[i]['MESSAGE.OBJECT_ID']} id={data[i]['MESSAGE.OBJECT_ID']} className={msgStyle.msgContent}>
          <a>{data[i].createdBy}</a>
          <p type='text' className={msgStyle.msgInput}>{data[i].text}</p>
          {/* {reply}
          {deleteB} */}
        </div>
      } else {
        htmlElement = <div key={data[i]['MESSAGE.OBJECT_ID']} id={data[i]['MESSAGE.OBJECT_ID']} className={msgStyle.msgContent2}>
          <a>{data[i].createdBy}</a>
          <p type='text' className={msgStyle.msgInput}>{data[i].text}</p>
          {/* {reply}
          {deleteB} */}
        </div>
      }
      msgsBuffer.push(htmlElement)
    }
    this.setState({msgs: msgsBuffer})
  }

  handleConvActions (action, objects) {
    let deleteObj = objects
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.DELETE_CONVERSATION_MSGS
    switch (action) {
      case 'btnReplay':
        alert('BTN REPLY')
        console.log(deleteObj)
        console.log('BtnReply')
        break
      case 'btnDelete':
        axios({
          method: 'post',
          data: '',
          url: restUrl + this.props.security.svSession + '/' + objects['MESSAGE.OBJECT_ID'] + '/' + objects['MESSAGE.OBJECT_TYPE'] + '/' + objects['MESSAGE.PKID'],
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response) {
          console.log('success')
        })
          .catch(function (response) {
          /* initMsgData() with function or triger re-render */
            console.log('error')
          })
        console.log('BtnDelete')
        break
      default:
    }
  }

  render () {
    return (
      <div>
        <div id='allMessages'>
          {this.state.msgs}
        </div>
        {/* <div id='btnHolder' className={msgStyle.btnHolder}>
           <a onClick={() => { this.handleConvActions('btnReplay') }} className={msgStyle.btnReply}>Reply</a>
          <a onClick={() => { this.handleConvActions('btnDelete') }} className={msgStyle.btnDelete}>Delete</a>
        </div> */}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    security: state.security
  }
}

export default connect(mapStateToProps)(Msgs)
