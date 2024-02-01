import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux';
import { alertUser, GridManager } from '../../elements'

class CreateAclCodes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      aclCode: '',
      accessType: '',
    }
  }

  saveAclCodes = (e) => {
    e.preventDefault()
    if ((this.state.aclCode && this.state.aclCode.length > 0) && (this.state.accessType && this.state.accessType.length > 0)) {
      let type
      let restUrl = window.server + '/WsAdminConsole/createCustomAcl/' + this.props.svSession
      let params = { 'aclCode': this.state.aclCode, 'accessType': this.state.accessType }
      axios({
        method: 'post',
        data: params,
        url: restUrl,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then((response) => {
        if (response.data) {
          if (response.data.type && response.data.message) {
            if (response.data.type === 'SUCCESS') {
              this.setState({ aclCode: '', accessType: '' })
              GridManager.reloadGridData('SVAROG_ACL')
            }
          }
          type = response.data.type
          type = type.toLowerCase()
          alertUser(true, response.data.type.toLowerCase(), response.data.message)
        }
      }).catch((err) => {
        if (err.data) {
          if (err.data.type && err.data.message) {
            alertUser(true, err.data.type.toLowerCase(), err.data.message)
          }
        }
      })
    } else {
      alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.admin_console.fill_inputs', defaultMessage: 'perun.admin_console.fill_inputs' }))
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value })
  }

  render() {
    const { aclCode, accessType } = this.state
    return (
      <div className='admin-console-acl-create'>
        <form className='admin-console-dropdown-container'>
          <fieldset>
            <legend className='admin-console-dropdown-title'>{this.context.intl.formatMessage({ id: 'perun.admin_console.create_permission', defaultMessage: 'perun.admin_console.create_permission' })}</legend>
            <div className='custom-form-element'>
              <label htmlFor='accessType'>{this.context.intl.formatMessage({ id: 'perun.admin_console.permission_type', defaultMessage: 'perun.admin_console.permission_type' })}:</label>
              <select className='form-control' id="accessType" value={accessType} onChange={this.onChange}>
                <option value='default' disable='disable' selected>{this.context.intl.formatMessage({ id: 'perun.admin_console.choose_value', defaultMessage: 'perun.admin_console.choose_value' })}</option>
                <option value='READ'>READ</option>
                <option value='MODIFY'>MODIFY</option>
                <option value='NONE'>NONE</option>
                <option value='WRITE'>WRITE</option>
                <option value='EXECUTE'>EXECUTE</option>
                <option value='FULL'>FULL</option>
              </select>
            </div>
            <div className='custom-form-element'>
              <label htmlFor='aclCode'>
                {this.context.intl.formatMessage({ id: 'perun.admin_console.code_control_guide', defaultMessage: 'perun.admin_console.code_control_guide' })}
              </label>
              <textarea
                className='textArea'
                style={{ width: '100%' }}
                value={aclCode}
                id='aclCode'
                rows='4'
                placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.permission_input_holder', defaultMessage: 'perun.admin_console.permission_input_holder' })}
                onChange={this.onChange} />
            </div>
            <button id='saveAcl' className='btn-success btn_save_form' style={{ float: 'right' }} onClick={this.saveAclCodes}>{this.context.intl.formatMessage({ id: 'perun.admin_console.save', defaultMessage: 'perun.admin_console.save' })}</button>
          </fieldset>
        </form>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

CreateAclCodes.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(CreateAclCodes)
