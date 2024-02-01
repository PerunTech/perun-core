import React from 'react';
import { connect } from 'react-redux';
import { labelBasePath } from '../../config';
import msgStyle from './ShowMsg.module.css';

class SearchConversation extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showConv: ''
    }
  }

  onChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  render () {
    return (
      <div className={msgStyle.searchForm}>
        <form onSubmit={this.handleConvActions}>
          <label>Title:</label>
          <input type='text' name='TITLE' id='TITLE' value='' onChange={this.onChange} placeholder='Title...' />
          <br />
          <label>
            {this.context.intl.formatMessage({ id: `${labelBasePath}.main.assignedTo`, defaultMessage: `${labelBasePath}.main.assignedTo` })}
          </label>
          <input id='ASSIGNED_TO_USERNAME' type='text' name='ASSIGNED_TO_USERNAME' placeholder='Enter min 4 characters' value='' onChange={this.onChange} />
          <br />
          <label>Assigned To:</label>
          <input id='ASSIGNED_TO_USERNAME' type='text' name='ASSIGNED_TO_USERNAME' placeholder='Enter min 4 characters' value='' onChange={this.onChange} />
          <br />
          <select id='priority' name='PRIORITY' value='' onChange={this.onChange} >
            <option value='0' selected disabled>PRIORITY</option>
            <option value='LOW'>priority.low</option>
            <option value='NORMAL'>priority.normal</option>
            <option value='HIGH'>priority.high</option>
            <option value='IMMEDIATE'>priority.immediate</option>
          </select>
          <select id='CATEGORY' value='0' name='CATEGORY' onChange={this.onChange}>
            <option value='0' selected disabled>Conversation_Category</option>
            <option value='TASK'>TASK</option>
            <option value='INFO'>INFO</option>
          </select>
          {/* <select id='MODULE_NAME' name='MODULE_NAME' value='0' onChange={this.onChange}>
            <option value='0' selected disabled>MODULES</option>
            <option value='EDINSTVENO_2018'>modules.edinstveno_2018</option>
            <option value='EDINSTVENO_2017'>modules.edinstveno_2017</option>
            <option value='EDINSTVENO_2016'>modules.edinstveno_2016</option>
          </select> */}
          <input type='submit' value='Search' />
          <br />
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

export default connect(mapStateToProps)(SearchConversation)
