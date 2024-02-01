import React from 'react'
import { store } from '../../model';
import { GridManager } from 'components/ComponentsIndex'

export default class UsersGrid extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      grid: null
    }
  }

  componentDidMount () {
    this.generateUsersGrid()
  }

  generateUsersGrid = () => {
    const usersGridId = 'SVAROG_USERS_GRID'
    GridManager.reloadGridData(usersGridId)

    const grid = GridManager.generateGridWithCustomSize(usersGridId, usersGridId, 'CUSTOM_GRID', 'BASE_DATA', [{
      PARAM_NAME: 'session',
      PARAM_VALUE: store.getState().security.svSession
    }, {
      PARAM_NAME: 'gridName',
      PARAM_VALUE: 'SVAROG_USERS'
    }, {
      PARAM_NAME: 'gridConfigWeWant',
      PARAM_VALUE: 'SVAROG_USERS'
    }, {
      PARAM_NAME: 'rowlimit',
      PARAM_VALUE: '10000'
    },
    ], 'CUSTOM', this.onRowClick)

    this.setState({
      grid: grid
    })
  }

  onRowClick = () => {};

  render () {
    const { grid } = this.state
    return (
      <React.Fragment >
        <div className='animation-right'>
          { grid }
        </div>
      </React.Fragment>
    )
  }
}