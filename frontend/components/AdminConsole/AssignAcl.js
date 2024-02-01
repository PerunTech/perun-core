import React from 'react'
import { axios, PropTypes } from '../../client'
import { connect } from 'react-redux'
import { alertUser, GridManager } from '../../elements'

const customFormState = {
  actionType: undefined,
  aclList: undefined,
  groupType: undefined
}
class AssignAcl extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount() {
    this.getAllGroups()
  }

  getAllGroups = () => {
    let th1s = this
    const url = window.server + '/WsAdminConsole/getAllGroups/' + this.props.svSession
    axios.get(url)
      .then((response) => {
        if (response.data) {
          if (response.data.data)
            th1s.generateCustomForm(response.data.data)
        }
      })
      .catch((error) => {
        console.error(error)
        if (error.data) {
          if (error.data.type) {
            th1s.setState({ alert: alertUser(true, error.data.type.toLowerCase(), error.data.message, null) })
          }
        }
      })
  }

  generateCustomForm = (allGroups) => {
    this.setState({ allGroupsState: allGroups })
    let initOptionVal = <option value='0' disabled='disabled' selected>{this.context.intl.formatMessage({ id: 'perun.admin_console.choose_value', defaultMessage: 'perun.admin_console.choose_value' })}</option>
    let optionsArr = [initOptionVal]
    allGroups.map((el) => {
      let opt = <option key={el.groupName} id={el.groupName} value={el.objectId}>{el.groupName}</option>
      optionsArr.push(opt)
    })
    let customForm = <React.Fragment>
      <div className='admin-console-acl-create'>
        <form className='admin-console-dropdown-container'>
          <fieldset>
            <legend className='admin-console-dropdown-title'>{this.context.intl.formatMessage({ id: 'perun.admin_console.permission_legend', defaultMessage: 'perun.admin_console.permission_legend' })}</legend>
            <div className='custom-form-element'>
              <label htmlFor='actionType'>{this.context.intl.formatMessage({ id: 'perun.admin_console.menage_permission', defaultMessage: 'perun.admin_console.menage_permission' })}</label>
              <select onChange={this.onChange} value={this.state.actionType} name='actionType' id='actionType' className='form-control'>
                <option value='0' disabled='disabled' selected>{this.context.intl.formatMessage({ id: 'perun.admin_console.choose_value', defaultMessage: 'perun.admin_console.choose_value' })}</option>
                <option value='REVOKE'>{this.context.intl.formatMessage({ id: 'perun.admin_console.take_permission', defaultMessage: 'perun.admin_console.take_permission' })}</option>
                <option value='GRANT'>{this.context.intl.formatMessage({ id: 'perun.admin_console.give_permission', defaultMessage: 'perun.admin_console.give_permission' })}</option>
              </select>
            </div>
            <div className='custom-form-element'>
              <label htmlFor='groupType'>{this.context.intl.formatMessage({ id: 'perun.admin_console.group_type_label', defaultMessage: 'perun.admin_console.group_type_label' })}</label>
              <select onChange={this.onChange} value={this.state.groupType} name='groupType' id='groupType' className='form-control'>
                {optionsArr}
              </select>
            </div>
            <div className='custom-form-element'>
              <label htmlFor='aclList'> {this.context.intl.formatMessage({ id: 'perun.admin_console.code_control_guide', defaultMessage: 'perun.admin_console.code_control_guide' })}</label>
              <textarea
                style={{ width: '100%' }}
                name='aclList'
                value={this.state.aclList}
                id='aclList'
                rows='4'
                placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.permission_input_holder', defaultMessage: 'perun.admin_console.permission_input_holder' })}
                onChange={this.onChange}
              />
            </div>
            <button id='saveAclCode' className='btn-success btn_save_form' style={{ float: 'right' }} onClick={this.saveAcl}>{this.context.intl.formatMessage({ id: 'perun.admin_console.save', defaultMessage: 'perun.admin_console.save' })}</button>
          </fieldset>
        </form>
      </div>
    </React.Fragment>
    this.setState({ showCustomForm: customForm })
  }

  saveAcl = (e) => {
    e.preventDefault()
    if ((this.state.actionType && this.state.actionType.length > 0) && (this.state.aclList && this.state.aclList.length > 0) && (this.state.groupType && this.state.groupType.length > 0)) {
      let postUrl = window.server + '/WsAdminConsole/manageCustomAcl/' + this.props.svSession
      let valueToSend = { 'manage': this.state.actionType, 'aclCode': this.state.aclList, 'groupObjId': this.state.groupType }
      let th1s = this
      axios({
        method: 'post',
        data: valueToSend,
        url: postUrl,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then((response) => {
        if (response.data) {
          if (response.data.type && response.data.message) {
            alertUser(true, response.data.type.toLowerCase(), response.data.message)
            if (response.data.type === 'SUCCESS') {
              th1s.setState(customFormState)
              th1s.setState({ showCustomForm: '' }, () => { th1s.generateCustomForm(th1s.state.allGroupsState) })
              GridManager.reloadGridData('SVAROG_ACL')
            }
          }
        }
      }).catch((err) => {
        if (err.data) {
          if (err.data.type && err.data.message) {
            th1s.setState(customFormState)
            th1s.setState({ showCustomForm: '' }, () => { th1s.generateCustomForm(th1s.state.allGroupsState) })
            alertUser(true, err.data.type.toLowerCase(), err.data.message)
          }
        }
      })
    } else {
      alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.admin_console.fill_input_values', defaultMessage: 'perun.admin_console.fill_input_values' }))
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { showCustomForm } = this.state
    return (
      <React.Fragment>
        {showCustomForm}
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

AssignAcl.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(AssignAcl)

