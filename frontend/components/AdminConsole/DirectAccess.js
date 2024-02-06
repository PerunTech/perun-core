import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import Select from 'react-select'
import { alertUser } from '../../elements'
import { store, logoutUser } from '../../model';
import Loading from '../Loading/Loading'
import { svConfig } from '../../config'

class DirectAccess extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  writeTypeAccess = (object) => {
    if (object.value === 'directAccess')
      this.setState({ typeAccess: object, showGroup: false, showModule: true, multiValue: '', contextName: '' });

    if (object.value === 'accessGroup')
      this.setState({
        typeAccess: object, showGroup: true, showModule: false,
        multiValue: '', contextName: ''
      });
  }

  handleMultiChange = (option) => {
    this.setState({ multiValue: option, showModule: true });
  }

  handleChange = (value) => {
    this.setState({ contextName: value });
  }

  componentDidMount() {
    this.getAllGroups()
  }

  getAllGroups = () => {
    let type
    let url = window.server + '/WsAdminConsole/getAllGroups/' + this.props.svSession
    this.setState({ loading: <Loading /> })
    let th1s = this
    axios.get(url)
      .then((response) => {
        if (response.data) {
          th1s.createUpdateTableAccessModal(response.data)
        }
        th1s.setState({ loading: false })
      }).catch((error) => {
        if (error.data) {
          type = error.data.type
          type = type.toLowerCase()
          alertUser(true, type, error.data.message, null)
          th1s.setState({ loading: false })
        }
      })
  }

  createUpdateTableAccessModal = (data) => {
    let allGroups = data.data
    allGroups = JSON.stringify(allGroups);
    allGroups = allGroups.replaceAll('groupName', 'label')
    allGroups = allGroups.replaceAll('objectId', 'value')
    allGroups = JSON.parse(allGroups)
    this.setState({ filterOptions: allGroups })

    let type
    let url = window.server + `/ReactElements/getOptionsFromTable/${this.props.svSession}/SVAROG_PERUN_PLUGIN/CONTEXT_NAME`
    this.setState({ loading: <Loading /> })
    let th1s = this
    axios.get(url)
      .then((response) => {
        if (response.data) {
          th1s.singleOptionValueDrop(response.data.data)
        }
        this.setState({ loading: false })
      }).catch((error) => {
        if (error.data) {
          type = error.data.type
          type = type.toLowerCase()
          alertUser(true, type, error.data.message, null)
          this.setState({ loading: false })
        }
      })
  }

  singleOptionValueDrop = (modulesV) => {
    let modules = modulesV
    modules = JSON.stringify(modules);
    modules = modules.replaceAll('text', 'label')
    modules = JSON.parse(modules)
    this.setState({ filterOptionsModules: modules })
  }

  prepareSaveJson = (multiValue, typeAccess) => {
    let saveJson
    if (typeAccess.value === 'directAccess')
      return saveJson = { 'directAccess': true }

    if (typeAccess.value === 'accessGroup') {
      let groups = []
      multiValue.map((el) => {
        groups.push(el.label)
      })
      return saveJson = { 'directAccess': false, 'accessGroup': groups } // eslint-disable-line no-unused-vars
    }
  }

  closeAlert = () => {
    this.setState({ alert: alertUser(false, 'info', '') })
    this.logout()
  }

  logout = () => {
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.svSession
    store.dispatch(logoutUser(restUrl))
  }

  callOnSave = () => {
    const directAccessChangeLabel = this.context.intl.formatMessage({ id: 'perun.admin_console.direct_access_change', defaultMessage: 'perun.admin_console.direct_access_change' })
    const yesLabel = this.context.intl.formatMessage({ id: 'perun.admin_console.yes', defaultMessage: 'perun.admin_console.yes' })
    const noLabel = this.context.intl.formatMessage({ id: 'perun.admin_console.no', defaultMessage: 'perun.admin_console.no' })
    const { multiValue, contextName, showGroup, showModule } = this.state
    if ((contextName && multiValue.length > 0) && (showModule && showGroup)) {
      alertUser(true, 'info', directAccessChangeLabel, '', () => this.onSave(), null, true, yesLabel, noLabel)
    } else if (contextName && (showModule && showGroup === false)) {
      alertUser(true, 'info', directAccessChangeLabel, '', () => this.onSave(), null, true, yesLabel, noLabel)
    } else {
      alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.missingParams', defaultMessage: 'perun.missingParams' }), this.context.intl.formatMessage({ id: 'perun.please_enter_values', defaultMessage: 'perun.please_enter_values' }))
    }

  }

  onSave = () => {
    const { multiValue, typeAccess, contextName } = this.state
    let saveJson = this.prepareSaveJson(multiValue, typeAccess);
    let restUrl = window.server + `/WsConf/saveTypeAccess/${this.props.svSession}/${contextName.value}`
    let form_params = new URLSearchParams()
    form_params.append('guiMeta', JSON.stringify(saveJson))
    axios({
      method: 'post',
      data: form_params,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(response => {
      if (response.data) {
        if (response.data.type) {
          alertUser(true, response.data.type.toLowerCase(), response.data.message, null)
          this.setState({ typeAccess: '', multiValue: '', contextName: '', showGroup: '', showModule: '' }, () => {
            this.getAllGroups()
          })
        }
      }
    })
      .catch(error => {
        if (error.response.data.message === 'error.invalid_session') {
          this.setState({ alert: alertUser(true, 'error', error.response.data.message, null, this.closeAlert) })
        }
        if (error && error.data) {
          let type
          type = error.response.data.type
          type = type.toLowerCase()
          alertUser(true, type, error.response.data.message, null)
        }
      })
  }

  closeAlert = () => {
    this.setState({ alert: alertUser(false, 'info', '') })
    this.logout()
  }

  logout = () => {
    const restUrl = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.CORE_LOGOUT + this.props.svSession
    store.dispatch(logoutUser(restUrl))
  }

  render() {
    const { contextName, filterOptionsModules, multiValue, filterOptions, typeAccess, showGroup, showModule } = this.state;
    const keyTypeAccess = [
      {
        label: this.context.intl.formatMessage({
          id: 'perun.admin_console.direct_access_module.direct_access',
          defaultMessage: 'perun.admin_console.direct_access_module.direct_access'
        }),
        value: "directAccess"
      },
      {
        label: this.context.intl.formatMessage({
          id: 'perun.admin_console.direct_access_module.access_group',
          defaultMessage: 'perun.admin_console.direct_access_module.access_group'
        }),
        value: "accessGroup"
      }
    ]

    return (
      <div className='admin-console-direct-access'>
        <div id='dropDownContainer' className='admin-console-dropdown-container'>
          <div id='title' className='admin-console-dropdown-title'>
            <p style={{ marginBottom: '0.5vh' }}>{this.context.intl.formatMessage({ id: 'perun.adminConsole.direct_access_module', defaultMessage: 'perun.adminConsole.direct_access_module' })}</p>
          </div>
          <div id='dropDownHolder' className='admin-console-dropdown-holder'>
            <p className='admin-console-choose-desc'>{this.context.intl.formatMessage({ id: 'perun.adminConsole.choose_dropDown_value_for_module_menu', defaultMessage: 'perun.adminConsole.choose_dropDown_value_for_module_menu' })}</p>
            <Select
              name="typeKey"
              placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.module_access_key', defaultMessage: 'perun.admin_console.module_access_key' })}
              value={typeAccess}
              options={keyTypeAccess}
              onChange={this.writeTypeAccess}
            />
            {/* <label>Multi</label> */}
            {showGroup && <React.Fragment>
              <p className='admin-console-second-choose-desc'>{this.context.intl.formatMessage({ id: 'perun.adminConsole.choose_dropDown_value_for_module_access_group', defaultMessage: 'perun.adminConsole.choose_dropDown_value_for_module_access_group' })}</p>
              <Select style={{ marginTop: '1vh' }}
                name="filters"
                placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.module_access_groups', defaultMessage: 'perun.admin_console.module_access_groups' })}
                value={multiValue}
                options={filterOptions}
                onChange={this.handleMultiChange}
                multi
              /></React.Fragment>}
            {showModule && <React.Fragment>
              <p className='admin-console-second-choose-desc'>{this.context.intl.formatMessage({ id: 'perun.adminConsole.choose_dropDown_value_for_module_name', defaultMessage: 'perun.adminConsole.choose_dropDown_value_for_module_name' })}</p>
              <Select style={{ marginTop: '1vh' }}
                name="access"
                placeholder={this.context.intl.formatMessage({ id: 'perun.admin_console.module_name', defaultMessage: 'perun.admin_console.module_name' })}
                value={contextName}
                options={filterOptionsModules}
                onChange={this.handleChange}
              />
              <button id='saveBtn' className='btn-success btn_save_form' style={{ float: 'right', marginTop: '2vh' }} onClick={this.callOnSave}>{this.context.intl.formatMessage({ id: 'perun.adminConsole.save', defaultMessage: 'perun.adminConsole.save' })}</button></React.Fragment>}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

DirectAccess.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(DirectAccess)
