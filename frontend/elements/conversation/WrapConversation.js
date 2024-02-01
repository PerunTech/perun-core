import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { labelBasePath } from '../../config';
import { GridManager, ExportableGrid, alertUser } from '..';

import ShowMsg from './ShowMsg';
import CreateConversation from './CreateConversation';

import convStyle from './ShowMsg.module.css';
import conversationStyle from './WrapConversation.module.css';

class WrapConversation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showConv: null,
      showConvForm: null,
      createConvForm: null,
      show: false,
      conversationForm: false,
      showCreateConv: false,
      convType: undefined,
      VAL: '',
      showAlert: false,
      alertType: '',
      alertTitle: '',
      alertMessage: '',
      CHOOSE: 'ID',
      showInput: true,
      showDropdown: false
    }
    this.onChange = this.onChange.bind(this)
    this.showMyConversations = this.showMyConversations.bind(this)
    this.onRowSelect = this.onRowSelect.bind(this)
  }

  onChange(e) {
    switch (e.target.value) {
      case 'CATEGORY':
        this.setState({ showInput: false, showDropdown: true, VAL: 'TASK' })
        break
      case 'INFO' || 'TASK':
        if (this.state.CHOOSE === 'CATEGORY') {
          this.setState({ showInput: false, showDropdown: true })
        }
        break
      case 'ID':
        this.setState({ showInput: true, showDropdown: false, VAL: '' })
        break
      case 'CREATED_BY_USERNAME':
        this.setState({ showInput: true, showDropdown: false, VAL: '' })
        break
      case 'ASSIGNED_TO_USERNAME':
        this.setState({ showInput: true, showDropdown: false, VAL: '' })
        break
    }
    this.setState({ [e.target.name]: e.target.value })
  }

  /* show conversation form with msgs if there is any, and show actions like reply delete or export f.r */
  onRowSelect() {
    if (this.state.convType === 'searchComponent') {
      /* every time diff search result is expected a different key is created f.r */
      this.setState({ showConvForm: <ShowMsg conversationType={'SVAROG_CONVERSATION' + this.state.VAL + this.state.CHOOSE} /> })
    } else {
      this.setState({ showConvForm: <ShowMsg conversationType={this.state.convType} /> })
    }
    this.setState({ showConv: false, conversationForm: true })
  }

  /* display conversations in grid by selected action f.r */
  showMyConversations(conversationType) {
    GridManager.reloadGridData(conversationType)
    this.setState({
      convType: conversationType,
      showConv: false,
      show: false,
      conversationForm: false,
      showCreateConv: false
    })
    const params = []
    switch (conversationType) {
      case 'MY_CREATED':
        params.push({
          PARAM_NAME: 'session',
          PARAM_VALUE: this.props.security.svSession
        }, {
          PARAM_NAME: 'convType',
          PARAM_VALUE: conversationType
        }, {
          PARAM_NAME: 'user_name',
          PARAM_VALUE: '0'
        }, {
          PARAM_NAME: 'is_unread',
          PARAM_VALUE: '0'
        })
        this.setState({
          showConv: <ExportableGrid
            key={'MY_CREATED'}
            id={'MY_CREATED'}
            gridType={'CUSTOM'}
            onRowClickFunct={this.onRowSelect}
            configTableName={'SVAROG_CONVERSATION'}
            dataTableName={'GET_DATA_TABLE'}
            params={params}
            enableMultiSelect={undefined}
            onSelectChangeFunct={undefined}
            addRowSub={undefined}
            minHeight={500}
            minWidth={undefined}
          />
        })
        this.setState({ conversationForm: false, show: true })
        console.log('showing conversations')
        break
      case 'ASSIGNED_TO_ME':
        params.push({
          PARAM_NAME: 'session',
          PARAM_VALUE: this.props.security.svSession
        }, {
          PARAM_NAME: 'convType',
          PARAM_VALUE: conversationType
        }, {
          PARAM_NAME: 'user_name',
          PARAM_VALUE: '0'
        }, {
          PARAM_NAME: 'is_unread',
          PARAM_VALUE: '0'
        })
        this.setState({
          showConv: <ExportableGrid
            key={'ASSIGNED_TO_ME'}
            id={'ASSIGNED_TO_ME'}
            gridType={'CUSTOM'}
            onRowClickFunct={this.onRowSelect}
            configTableName={'SVAROG_CONVERSATION'}
            dataTableName={'GET_DATA_TABLE'}
            params={params}
            enableMultiSelect={undefined}
            onSelectChangeFunct={undefined}
            addRowSub={undefined}
            minHeight={500}
            minWidth={undefined}
          />
        })
        this.setState({ conversationForm: false, show: true })
        console.log('showing conversations assigne_to_me')
        break
      case 'WITH_MY_MESSAGE':
        params.push({
          PARAM_NAME: 'session',
          PARAM_VALUE: this.props.security.svSession
        }, {
          PARAM_NAME: 'convType',
          PARAM_VALUE: conversationType
        }, {
          PARAM_NAME: 'user_name',
          PARAM_VALUE: '0'
        }, {
          PARAM_NAME: 'is_unread',
          PARAM_VALUE: '0'
        })
        this.setState({
          showConv: <ExportableGrid
            key={'WITH_MY_MESSAGE'}
            id={'WITH_MY_MESSAGE'}
            gridType={'CUSTOM'}
            onRowClickFunct={this.onRowSelect}
            configTableName={'SVAROG_CONVERSATION'}
            dataTableName={'GET_DATA_TABLE'}
            params={params}
            enableMultiSelect={undefined}
            onSelectChangeFunct={undefined}
            addRowSub={undefined}
            minHeight={500}
            minWidth={undefined}
          />
        })
        this.setState({ conversationForm: false, show: true })
        console.log('showing conversations with_me_msg')
        break
      case 'createConversation':
        this.setState({
          createConvForm: <CreateConversation onConvCreateClick={this.props.onConvCreateClick} />,
          showCreateConv: true,
          conversationForm: false,
          show: false
        })
        break
      case 'searchComponent':
        if (this.state.VAL === '') {
          this.setState({
            showAlert: true,
            alertType: 'warning',
            alertTitle: this.context.intl.formatMessage({
              id: `${labelBasePath}.msgs.empty_search_field`,
              defaultMessage: `${labelBasePath}.msgs.empty_search_field`
            }),
            alertMessage: this.context.intl.formatMessage({
              id: `${labelBasePath}.msgs.search_field_must_have_value`,
              defaultMessage: `${labelBasePath}.msgs.search_field_must_have_value`
            })
          })
        } else {
          params.push({
            PARAM_NAME: 'session',
            PARAM_VALUE: this.props.security.svSession
          }, {
            PARAM_NAME: 'table_name',
            PARAM_VALUE: 'SVAROG_CONVERSATION'
          }, {
            PARAM_NAME: 'fieldNAme',
            PARAM_VALUE: this.state.CHOOSE
          }, {
            PARAM_NAME: 'fieldValue',
            PARAM_VALUE: this.state.VAL.toUpperCase()
          }, {
            PARAM_NAME: 'no_rec',
            PARAM_VALUE: '0'
          })
          this.setState({
            showConv: <ExportableGrid
              key={'SVAROG_CONVERSATION' + this.state.VAL + this.state.CHOOSE}
              id={'SVAROG_CONVERSATION' + this.state.VAL + this.state.CHOOSE}
              gridType={'CUSTOM'}
              onRowClickFunct={this.onRowSelect}
              configTableName={'SVAROG_CONVERSATION'}
              dataTableName={'GET_CONVERSATION_WITH_FILTER'}
              params={params}
              enableMultiSelect={undefined}
              onSelectChangeFunct={undefined}
              addRowSub={undefined}
              minHeight={500}
              minWidth={undefined}
            />
          })
          this.setState({ conversationForm: false, show: true })
        }
        console.log('serachConversations')
        break
      default:
    }
  }

  render() {
    const { VAL, CHOOSE } = this.state
    const { showAlert, alertType, alertTitle, alertMessage } = this.state
    return (
      <div id='mainAppContainer'>
        <div>
          {
            showAlert && alertUser(
              showAlert,
              alertType,
              alertTitle,
              alertMessage,
              () => { this.setState({ showAlert: false, alertType: 'info' }) }
            )
          }
        </div>
        <div id='leftWrapper' className={conversationStyle.wrap_left}>
          <button className='btn btn-md' onClick={() => { this.showMyConversations('ASSIGNED_TO_ME') }}>
            {this.context.intl.formatMessage({ id: `${labelBasePath}.main.showConvAssignedToMe`, defaultMessage: `${labelBasePath}.main.showConvAssignedToMe` })}
          </button>
          <br />
          <button className='btn btn-md' onClick={() => { this.showMyConversations('MY_CREATED') }}>
            {this.context.intl.formatMessage({ id: `${labelBasePath}.main.showConvCreatedByMe`, defaultMessage: `${labelBasePath}.main.showConvCreatedByMe` })}
          </button>
          <br />
          <button className='btn btn-md' onClick={() => { this.showMyConversations('WITH_MY_MESSAGE') }}>
            {this.context.intl.formatMessage({ id: `${labelBasePath}.main.showConvWithMyMsg`, defaultMessage: `${labelBasePath}.main.showConvWithMyMsg` })}
          </button>
          <br />
          <button className='btn btn-md btn-info' onClick={() => { this.showMyConversations('createConversation') }}>
            {this.context.intl.formatMessage({ id: `${labelBasePath}.main.createNewConv`, defaultMessage: `${labelBasePath}.main.createNewConv` })}
          </button>
          <div className={convStyle.searchForm}>
            <select id='choose' name='CHOOSE' value={CHOOSE} onChange={this.onChange} >
              <option value='ID'>Message ID</option>
              <option value='CATEGORY'>Ticket Category</option>
              <option value='CREATED_BY_USERNAME'>Created by</option>
              <option value='ASSIGNED_TO_USERNAME'>Assigned To</option>
            </select>
            {this.state.showInput && <input type='text' name='VAL' id='VAL' value={VAL} onChange={this.onChange} placeholder='Input Value...' />}
            {this.state.showDropdown && <select id='VAL' name='VAL' value={VAL} onChange={this.onChange} >
              <option value='TASK'>TASK</option>
              <option value='INFO'>INFO</option>
            </select>}
            <br />
            <button className='btn btn-md btn-info' onClick={() => { this.showMyConversations('searchComponent') }}>Search</button>
            <br />
          </div>
        </div>
        <div id='rightWrapper' className={conversationStyle.wrap_right}>
          {this.state.showCreateConv && this.state.createConvForm}
          {this.state.show && this.state.showConv}
          {this.state.conversationForm && this.state.showConvForm}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    security: state.security
  }
}

WrapConversation.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(WrapConversation)
