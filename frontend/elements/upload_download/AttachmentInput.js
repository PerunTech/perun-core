import React from 'react'
import { connect } from 'react-redux';
import style from './AttachmentStyles.module.css'
import PropTypes from 'prop-types'
import axios from 'axios'
import { iconManager } from '../../assets/svg/svgHolder'
import { alertUser } from '../util/alertUser';
import Loading from '../../components/Loading/Loading';

/**
* MANDATORY PARAMETERS
* @param {string} saveUrl - url for save attachment
* OPTIONAL PARAMETERS
* @param {string} objectId - object id that is needed for save
* @param {boolean} hideAttachBtn - set it to true when attach button is not needed
* @param {function} returnInput - function to return the uploaded value
*/

class AttachmentInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hideAttachBtn : this.props.hideAttachBtn,
      returnInput: this.props.returnInput
    }
  }

  componentDidMount () {
    if (this.props.objectId && this.props.saveUrl) { /* scenario where button for save is needed */
      this.setState({ selectedRowObjId : this.props.objectId }, () => {
        this.generateRender()
      })
    } else if (this.props.returnInput && this.props.hideAttachBtn) { /*scenario where the save is trough form save */
        this.generateRender()
    } else {
      console.warn('Missing prop')
    }
  }

  generateRender = () => {
    this.setState({
      renderInput : <div className={`${style.divUploadFile}`}>
        <label className={`${style.labelStyle}`} htmlFor='upload_File' id='uploadLabel'> {this.context.intl.formatMessage({ id: 'perun.upload_file', defaultMessage: 'perun.upload_file' })} </label>
        <div className={`${style.uploadFileHolder}`}>
          <input type="file" id='upload_File' style={{display: 'flex', margin: '0'}} onChange={this.inputChange}/>
          {this.state.hideAttachBtn === true ? null : <button className={`${style.uploadFileBtn}`} onClick={(e) => this.saveAttachment(e)} id='uploadBtn'>{iconManager.getIcon('uploadAtt')} {this.context.intl.formatMessage({ id: 'perun.upload_file', defaultMessage: 'perun.upload_file' })} </button>}
        </div>
      </div>
    })
  }

  inputChange = (e) => {
    if (this.state.returnInput) {
      this.state.returnInput(e)
    } else {
      this.setState({ attachedFile: e.target.files[0] })
    }
  }

  saveAttachment = (e) => {
    this.setState({ loading : <Loading /> })
    e.preventDefault()
    const { callBack, saveUrl } = this.props
    const { selectedRowObjId, attachedFile } = this.state
    let type
    let th1s = this
    if (attachedFile && selectedRowObjId) {
      const data = new FormData()
      data.append('file', attachedFile)
      axios({
        method: 'post',
        data: data,
        url: saveUrl,
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(function (response) {
        alertUser(true, response.data.type.toLowerCase(), response.data.message)  
        callBack && callBack()
        th1s.setState({ attachedFile: '', loading: ''})
      })
      .catch(function (error) {
        th1s.setState({ attachedFile: '', loading: ''})
        type = error.data.type
        type = type.toLowerCase()
        alertUser(true, type, error.data.message)
      })
    } else {
      alertUser(true, 'info', 'Немате прикачено документ', 'Ве молиме прикачете документ пред да зачувате')
      th1s.setState({ attachedFile: '', loading: ''})
    }
  }

  render () {
    const { renderInput, loading } = this.state
    return (
      <React.Fragment>
        {loading}
        {renderInput}
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

AttachmentInput.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(AttachmentInput)


