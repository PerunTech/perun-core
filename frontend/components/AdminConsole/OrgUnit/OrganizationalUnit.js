import React, { useState, useEffect } from "react";
import { ComponentManager, ExportableGrid, GridManager, GenericForm, PropTypes } from "../../../client";
import { connect } from "react-redux";
import axios from "axios";
import OrganizationalUnitModal from "./OrganizationalUnitModal";
import { alertUser, ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
let gridId;
let gridId2;
let pastObjOU = "";

const OrganizationalUnit = (props, context) => {
  const [grid, setGrid] = useState(undefined);
  const [gridUser, setGridUser] = useState(undefined);
  const [showUser, setShowUser] = useState(false);
  const [currentObj, setObj] = useState("");
  const [userForm, setShowUserForm] = useState(false);
  const [rowUser, setRowUser] = useState("");
  const [form, setForm] = useState(undefined);

  useEffect(() => {
    generateOrgUnitGrid();

    return () => {
      ComponentManager.cleanComponentReducerState(gridId);
      ComponentManager.cleanComponentReducerState(gridId2);
    };
  }, []);

  const generateOrgUnitGrid = () => {
    const { svSession } = props;
    gridId = "UNITS_GRID";
    let grid = (
      <ExportableGrid
        gridType={"READ_URL"}
        key={gridId}
        id={gridId}
        configTableName={`/ReactElements/getTableFieldList/${svSession}/SVAROG_ORG_UNITS`}
        dataTableName={`/ReactElements/getTableData/${svSession}/SVAROG_ORG_UNITS/100`}
        defaultHeight={false}
        heightRatio={0.5}
        refreshData={true}
        onRowClickFunct={onRowClick}
        minHeight={600}
      />
    );
    setGrid(grid);
  };

  const generateUserGrid = (objectIdOU) => {
    pastObjOU = objectIdOU;
    GridManager.reloadGridData(`USER_UNIT_GRID_${objectIdOU}`);
    const { svSession } = props;
    gridId2 = `USER_UNIT_GRID_${objectIdOU}`;

    let grid = (
      <div style={{ width: "60%" }}>
        <p className='admin-console-grid-legend admin-console-legend'>{context.intl.formatMessage({ id: 'perun.admin_console.choose_user', defaultMessage: 'perun.admin_console.choose_user' })}</p>
        <ExportableGrid
          gridType={"READ_URL"}
          key={gridId2}
          id={gridId2}
          configTableName={`/ReactElements/getTableFieldList/${svSession}/SVAROG_USERS`}
          dataTableName={`/WsAdminConsole/get/usersByOU/sid/${svSession}/objectIdOU/${objectIdOU}`}
          defaultHeight={false}
          heightRatio={0.5}
          refreshData={true}
          toggleCustomButton={true}
          customButton={() => showUserModal()}
          customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add_user', defaultMessage: 'perun.admin_console.add_user' })}
          onRowClickFunct={onUserRowClick}
          minHeight={600}
        />
      </div>
    );
    setGridUser(grid);
  };

  const onRowClick = (_id, _rowIdx, row) => {
    let objectIdOU = row["SVAROG_ORG_UNITS.OBJECT_ID"];
    setObj(objectIdOU);
    if (pastObjOU != objectIdOU) {
      ComponentManager.cleanComponentReducerState(`USER_UNIT_GRID_${pastObjOU}`);
    }
    setGridUser(undefined);
    generateUserGrid(objectIdOU);
  };

  const showUserModal = () => {
    setShowUser(!showUser);
  };

  const closeUserModal = () => {
    setShowUser(false);
  };

  const showUserForm = () => {
    setShowUserForm(!userForm);
  };

  const onUserRowClick = (_id, _rowIdx, row) => {
    showUserForm();
    let objecidUser = row["SVAROG_USERS.OBJECT_ID"];
    setRowUser(objecidUser);
    generateForm(objecidUser);
  };

  const generateForm = (objecidUser) => {
    const { svSession } = props;
    let form = (
      <GenericForm
        params={"READ_URL"}
        key={"general_condition"}
        id={"general_condition"}
        method={`/ReactElements/getTableJSONSchema/${svSession}/SVAROG_USERS`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/SVAROG_USERS`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${objecidUser}/SVAROG_USERS`}
        hideBtns={"all"}
      />
    );
    return setForm(form);
  };

  const removeUserFromOrgUnit = () => {
    const { svSession } = props;
    let url = `${window.server}/WsAdminConsole/get/removeUserFromOU/sid/${svSession}/objectIdOU/${currentObj}/objecidUser/${rowUser}`;
    axios.get(url).then((res) => {
      const resType = res.data.type?.toLowerCase() || 'info'
      const title = res.data.title || ''
      const msg = res.data.message || ''
      alertUser(true, resType, title, msg)
      if (resType === 'success') {
        GridManager.reloadGridData(`USER_UNIT_GRID_${currentObj}`);
        setShowUserForm(false)
      }
    }).catch((error) => {
      const title = error.response?.data?.title || error
      const msg = error.response?.data?.message || ''
      alertUser(true, 'error', title, msg)
    });
  };

  return (
    <React.Fragment>
      <div className='admin-console-org-unit'>
        <div style={{ width: "100%" }}>
          <p className='admin-console-unit-legend admin-console-legend'>{context.intl.formatMessage({ id: 'perun.admin_console.unit_legend', defaultMessage: 'perun.admin_console.unit_legend' })}</p>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <div style={{ width: "35%" }}>
            <p className='admin-console-grid-legend admin-console-legend'>{context.intl.formatMessage({ id: 'perun.admin_console.svarog_unit_name', defaultMessage: 'perun.admin_console.svarog_unit_name' })}</p>
            {grid}
          </div>

          {gridUser}
        </div>
      </div>
      <OrganizationalUnitModal
        show={showUser}
        showUserModal={showUserModal}
        closeUserModal={closeUserModal}
        objectIdOU={currentObj}
      />
      <Modal
        className='admin-console-unit-modal'
        show={userForm}
        onHide={showUserForm}
      >
        <Modal.Header className='admin-console-unit-modal-header' closeButton>
          <Modal.Title className='admin-console-unit-modal-body'>
            {context.intl.formatMessage({ id: 'perun.admin_console.remove_user', defaultMessage: 'perun.admin_console.remove_user' })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='admin-console-unit-modal-body'>
          {form}
          <div className='admin-console-remove-user-con'>
            <button
              className='admin-console-remove-user-btn'
              onClick={() => removeUserFromOrgUnit()}
            >
              {context.intl.formatMessage({ id: 'perun.admin_console.remove', defaultMessage: 'perun.admin_console.remove' })}
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

OrganizationalUnit.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(OrganizationalUnit);
