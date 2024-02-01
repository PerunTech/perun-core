import React from "react";
import ExportableGrid from "../../elements/grid/ExportableGrid";
import PropTypes from "prop-types";
import { connect } from 'react-redux'
import { alertUser, ReactBootstrap, ComponentManager } from "../../elements";
import { GenericGrid } from '../../client';
const { Modal } = ReactBootstrap;
let prev
let prevacl
class UsersGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      objId: '',
      show: false
    };
    this.onRowClick = this.onRowClick.bind(this);
    this.generateUsersGrid = this.generateUsersGrid.bind(this);
  }

  componentDidMount() {
    this.generateUsersGrid();
  }

  componentWillUnmount() {
    ComponentManager.cleanComponentReducerState(prev)
    ComponentManager.cleanComponentReducerState(prevacl)
  }


  generateUsersGrid = () => {
    ComponentManager.cleanComponentReducerState(prev)
    let usersGridId = "SVAROG_USERS_GRID" + Math.floor(Math.random() * 999999).toString(36)
    prev = usersGridId
    ComponentManager.cleanComponentReducerState(usersGridId);

    let obj = [
      {
        name: this.context.intl.formatMessage({
          id: 'perun.admin_console.user_change',
          defaultMessage: 'perun.admin_console.user_change'
        }),
        action: () => this.props.editUser(),
        id: "btn-first",
      },
      {
        name: this.context.intl.formatMessage({
          id: "perun.main.changeUserGroup",
          defaultMessage: "perun.main.changeUserGroup",
        }),
        action: () => this.props.showUsersFn(),
        id: "btn-second",
      },
      {
        name: this.context.intl.formatMessage({
          id: "perun.main.show_acl_per_user",
          defaultMessage: "perun.main.show_acl_per_user",
        }),
        action: () => { this.state.objId ? this.setState({ show: true }) : alertUser(true, 'warning', this.context.intl.formatMessage({ id: 'perun.admin_console.missing_user', defaultMessage: 'perun.admin_console.missing_user' }, "")) },
        id: "btn-third",
      },
      // {
      //   name: this.context.intl.formatMessage({
      //     id: "perun.main.changeUserPassword",
      //     defaultMessage: "perun.main.changeUserPassword",
      //   }),
      //   action: () => this.props.changeUserPassword(),
      //   id: "btn-third",
      // },

    ];

    let grid = (
      <ExportableGrid
        gridType={"SEARCH_GRID_DATA"}
        key={usersGridId}
        id={usersGridId}
        configTableName={
          "/ReactElements/getTableFieldList/%session/SVAROG_USERS"
        }
        dataTableName={this.props.gridData}
        onRowClickFunct={this.onRowClick}
        toggleCustomButton={true}
        customButton={() => this.props.changeUserStatus()}
        customButtonLabel={this.context.intl.formatMessage({
          id: "perun.main.changeStatus",
          defaultMessage: "perun.main.changeStatus",
        })}
        buttonsArray={obj}
        refreshData={this.generateUsersGrid}
        heightRatio={0.5}
      />
    );

    ComponentManager.setStateForComponent(usersGridId, null, {
      onRowClickFunct: this.onRowClick,
      customButton: this.props.changeUserStatus,
      buttonsArray: obj,
    });

    this.setState({
      grid: grid,
    });
  };

  onRowClick(_gridId, _rowId, row) {
    const selectedStatus = row["SVAROG_USERS.STATUS"];
    const selectedObjId = row["SVAROG_USERS.OBJECT_ID"];
    this.setState({ objId: selectedObjId })
    const selectedUserName = row["SVAROG_USERS.FIRST_NAME"];
    this.props.rowClickFn(selectedStatus, selectedObjId, selectedUserName);
  }
  generateAclGrid = () => {
    ComponentManager.cleanComponentReducerState(prevacl)
    let gridId = 'ACL_PER_GROUP_GRID_' + Math.floor(Math.random() * 999999).toString(36)
    prevacl = gridId
    return <GenericGrid
      key={gridId}
      id={gridId}
      gridType={'READ_URL'}
      configTableName={`/WsAdminConsole/get-acl-by-user-field-list/sid/${this.props.svSession}`}
      dataTableName={`/WsAdminConsole/get-acl-by-user/sid/${this.props.svSession}/user_object_id/${this.state.objId}`}
      minHeight={600}
      refreshData={true}
    />
  }

  render() {
    const { grid, show } = this.state;
    return (
      <React.Fragment>
        <div className="animation-right">{grid}</div>
        <Modal
          className='admin-console-unit-modal'
          show={show}
          onHide={() => this.setState({ show: false })}
        >
          <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>{this.context.intl.formatMessage({
              id: 'perun.main.acl_per_user_title',
              defaultMessage: 'perun.main.acl_per_user_title'
            })}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body'>
            {show && this.generateAclGrid()}
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

UsersGrid.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(UsersGrid);
