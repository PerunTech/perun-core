import React from 'react'
import { store } from '../../model';
import { GridManager } from 'components/ComponentsIndex'

export default class GroupUsersGrid extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      grid: null
    }
  }

  componentDidMount () {
    this.generateGroupUsersGrid()
  }

  generateGroupUsersGrid = () => {
    const groupUsersGridId = 'SVAROG_USER_GROUP_GRID'
    const grid = GridManager.generateGridWithCustomSize(groupUsersGridId, groupUsersGridId, 'CUSTOM_GRID', 'BASE_DATA', [{
      PARAM_NAME: 'session',
      PARAM_VALUE: store.getState().security.svSession
    }, {
      PARAM_NAME: 'gridName',
      PARAM_VALUE: 'SVAROG_USER_GROUPS'
    }, {
      PARAM_NAME: 'gridConfigWeWant',
      PARAM_VALUE: 'SVAROG_USER_GROUPS'
    }, {
      PARAM_NAME: 'rowlimit',
      PARAM_VALUE: '10000'
    },
    ], 'CUSTOM', this.onRowClick)

    this.setState({
      grid: grid
    })
  }

  onRowClick = () => {}

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