import React from 'react';
import axios from 'axios';
import { svConfig } from '../../config';
import { store } from '../../model';
import { GridManager, alertUser } from '../../elements';
import { PropTypes } from '../../client';

let rowData
export default class SystemGrid extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      grid: null,
      alert: undefined
    }
  }

  componentDidMount () {
    this.generateSystemGrid()
  }

  generateSystemGrid = () => {
    const gridId = this.props.id
    const grid = GridManager.generateGridWithCustomSize(gridId, gridId, 'CUSTOM_GRID', 'BASE_DATA', [{

      PARAM_NAME: 'session',
      PARAM_VALUE: store.getState().security.svSession
    }, {
      PARAM_NAME: 'gridName',
      PARAM_VALUE: this.props.grid
    }, {
      PARAM_NAME: 'gridConfigWeWant',
      PARAM_VALUE: this.props.grid
    }, {
      PARAM_NAME: 'rowlimit',
      PARAM_VALUE: '10000'
    },
    ], 'CUSTOM', this.rowClicked)

    ComponentManager.setStateForComponent(gridId, null, {
      onRowClickFunct: this.onRowClick,
    })

    this.setState({
      grid: grid
    })
  }

  rowClicked = (stateVal, rowIdx, row) => {
    // /* global variable with data from clicked row f.r */
    rowData = row
  }

  deleteRow = () => {
    let type
    let component = this

    if(rowData) {
      if(rowData[component.props.grid + '.CARD_ID'] !== 'user_manager') {
      let url = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.DELETE_CARD + store.getState().security.svSession
      + '/' + rowData[component.props.grid + '.OBJECT_ID'] 
      + '/' + rowData[component.props.grid + '.OBJECT_TYPE'] 
      + '/' + rowData[component.props.grid + '.PKID']
      if(rowData[component.props.grid + '.CARD_ID'] !=='user_manager') {
       url = url + '/' + rowData[component.props.grid + '.CARD_ID']
      }
      axios({
        method: 'post',
        url: url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function () {
        component.setState({ alert: alertUser(true, 'success', this.context.intl.formatMessage({id:'perun.admin_console.remove_card', defaultMessage: 'perun.admin_console.remove_card'}), null, component.reload)})
      })
        .catch(function (response) {
          type = response.response.data.type
          type = type.toLowerCase()
          component.setState({ alert: alertUser(true, type, response.response.data.message, null, component.closeAlert) })
        })
      } else {
        component.setState({ alert: alertUser(true, 'warning', this.context.intl.formatMessage({id:'perun.admin_console.system_menu_error', defaultMessage: 'perun.admin_console.system_menu_error'}))})
      }
  } else {
    component.setState({ alert: alertUser(true, 'info', this.context.intl.formatMessage({id:'perun.admin_console.remove_row', defaultMessage: 'perun.admin_console.remove_row'}))})
  }
}

reload = () => {
  let component = this
  GridManager.reloadGridData(component.props.id)
  this.setState({rowData: undefined})
}

  render () {
    const { grid } = this.state
    return (
      <React.Fragment >
        <div className='animation-right'>
          { alert }
          <button className='button-delete' id='deleteBtn' onClick={this.deleteRow}>{this.context.intl.formatMessage({id:'perun.admin_console.delete_entry', defaultMessage: 'perun.admin_console.delete_entry'})}</button>
          { grid }
        </div>
      </React.Fragment>
    )
  }
}

SystemGrid.contextTypes = {
  intl: PropTypes.object.isRequired
}