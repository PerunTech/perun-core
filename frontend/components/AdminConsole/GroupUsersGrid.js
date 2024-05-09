import React from 'react'
import { ExportableGrid, PropTypes } from '../../client';
import { alertUser } from '../../elements';
import { ComponentManager } from '../../elements';

export default class GroupUsersGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      grid: null,
      setModal: null,
    }
    this.onRowClick = this.onRowClick.bind(this)
    this.showUserGroupsFunc = this.showUserGroupsFunc.bind(this)
    this.editUsersGroupFunc = this.editUsersGroupFunc.bind(this)
  }

  componentDidMount() {
    this.generateGroupUsersGrid()
  }

  generateGroupUsersGrid = () => {
    const groupUsersGridId = 'SVAROG_USER_GROUP_GRID'
    const grid = <ExportableGrid
      key={groupUsersGridId}
      id={groupUsersGridId}
      gridType={'READ_URL'}
      configTableName={`/ReactElements/getTableFieldList/%session/SVAROG_USER_GROUPS`}
      dataTableName={`/ReactElements/getTableData/%session/SVAROG_USER_GROUPS/0`}
      onRowClickFunct={this.onRowClick}
      heightRatio={0.75}
      refreshData={true}
      customButton={this.showUserGroupsFunc}
      customButtonLabel={this.context.intl.formatMessage({ id: 'perun.adminConsole.show_group_details', defaultMessage: 'perun.adminConsole.show_group_details' })}
      toggleCustomButton={true}
      additionalButton={this.editUsersGroupFunc}
      additionalButtonLabel={this.context.intl.formatMessage({ id: 'perun.generalLabel.edit', defaultMessage: 'perun.generalLabel.edit' })}
    />
    ComponentManager.setStateForComponent(groupUsersGridId, null, {
      onRowClickFunct: this.onRowClick,
      customButton: this.showUserGroupsFunc,
      additionalButton: this.editUsersGroupFunc
    })

    this.setState({
      grid: grid
    })
  }

  componentWillUnmount() {
    ComponentManager.cleanComponentReducerState('SVAROG_USER_GROUP_GRID');
  }

  editUsersGroupFunc() {
    if (this.state.objId && this.state.groupName) {
      this.props.editUserGroupsFn(this.state.objId, this.state.groupName);
    } else {
      this.setState({ alert: alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.code.user_groups_error', defaultMessage: 'perun.admin_console.code.user_groups_error' }), null) })
    }
  }

  showUserGroupsFunc() {
    if (this.state.objId && this.state.groupName) {
      this.props.showUserGroupsFn(this.state.objId, this.state.groupName)
    } else {
      this.setState({ alert: alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.code.user_groups_error', defaultMessage: 'perun.admin_console.code.user_groups_error' }), null) })
    }
  }

  onRowClick(gridId, rowId, row) {
    const selectedGroupName = row['SVAROG_USER_GROUPS.GROUP_NAME']
    const selectedGroupObjId = row['SVAROG_USER_GROUPS.OBJECT_ID']
    this.setState({ objId: selectedGroupObjId, groupName: selectedGroupName })
  }

  render() {
    const { grid } = this.state
    return (
      <React.Fragment >
        <div className='admin-console-grid-container'>
          {grid}
        </div>
      </React.Fragment>
    )
  }
}

GroupUsersGrid.contextTypes = {
  intl: PropTypes.object.isRequired
}
