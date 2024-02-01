import React from 'react';
import { connect } from 'react-redux';
import msgStyle from './ShowMsg.module.css';

const initialState = {
  category: '0',
  module: '0',
  priority: '0',
  assignedTo: '',
  title: ''
}

class ConHeader extends React.Component {
  constructor (props) {
    super(props)
    this.state = initialState
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleConvActions = (event) => {
    const dataForm = this.state
    event.preventDefault()
    // const data = new FormData(event.target)
    switch (dataForm) {
      case 'btnCreate':
        alert('create')
        console.log('btnCreate')
        break
      case 'btnDeleteConv':
        alert('deleteConv')
        console.log('btnDeleteConv')
        break
      default:
    }
  }

  resetForm = () => {
    this.setState(initialState)
  }

  render () {
    const {category, priority, module, title, assignedTo} = this.state
    return (
      <div id='createConvForm'>
        <div className={msgStyle.form_style_5}>
          <form onSubmit={this.handleConvActions}>
            <fieldset>
              {/* <legend><span className='number'></span> Conversation</legend> */}
              <select id='category' value={category} name='category' onChange={this.onChange}>
                <option value='0' selected disabled>CATEGORY</option>
                <option value='ALL'>list_categories.all</option>
                <option value='EXTERNAL'>list_categories.external</option>
                <option value='INTERNAL'>list_categories.internal</option>
              </select>
              <select id='module' name='module' value={module} onChange={this.onChange}>
                <option value='0' selected disabled>MODULES</option>
                <option value='EDINSTVENO_2018'>modules.edinstveno_2018</option>
                <option value='EDINSTVENO_2017'>modules.edinstveno_2017</option>
                <option value='EDINSTVENO_2016'>modules.edinstveno_2016</option>
              </select>
              <input type='text' name='title' id='title' value={title} onChange={this.onChange} placeholder='Title...' />
              <select id='priority' name='priority' value={priority} onChange={this.onChange} >
                <option value='0' selected disabled>PRIORITY</option>
                <option value='LOW'>priority.low</option>
                <option value='NORMAL'>priority.normal</option>
                <option value='HIGH'>priority.high</option>
                <option value='IMMEDIATE'>priority.immediate</option>
              </select>
              <input id='assignedTo' type='text' name='assignedTo' placeholder='Assigned To...' value={assignedTo} onChange={this.onChange} />
            </fieldset>
            <input type='submit' value='Create' />
            <input onClick={this.resetForm} type='button' value='Cancel' />
          </form>
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

export default connect(mapStateToProps)(ConHeader)
