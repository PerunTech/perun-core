import React from "react";
import { connect } from "react-redux";
import { alertUser, ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import axios from "axios";
import { GridManager, PropTypes } from "../../../client";
import OrgSearch from "./OrgSearch";

const OrganizationalUnitModal = (props, context) => {
  const handleRowClick = (_id, _rowIdx, row) => {
    alertUser(
      true,
      "info",
      context.intl.formatMessage({ id: 'perun.admin_console.add_user', defaultMessage: 'perun.admin_console.add_user' }),
      context.intl.formatMessage({ id: 'perun.admin_console.svarog_unit_add_user', defaultMessage: 'perun.admin_console.svarog_unit_add_user' }),
      () => { saveApp(row), props.closeUserModal() },
      () => { },
      true,
      context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' }),
      context.intl.formatMessage({ id: 'perun.admin_console.cancel', defaultMessage: 'perun.admin_console.cancel' })
    );
  };

  //save/submit function that creates sap-application
  const saveApp = (row) => {
    let objecidUser = row['SVAROG_USERS.OBJECT_ID']
    let url = window.server + `/WsAdminConsole/get/assignUserToOU/sid/${props.svSession}/objectIdOU/${props.objectIdOU}/objecidUser/${objecidUser}`
    axios.get(url).then((res) => {
      if (res.data.type == "SUCCESS") {
        alertUser(true, 'success', 'Успешно додадовте корисник.')
        GridManager.reloadGridData(`USER_UNIT_GRID_${props.objectIdOU}`);
      } else {
        alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message)
      }
    }).catch(function (error) {
      if (error) {
        if (error.data) {
          alertUser(
            true,
            error.data.type.toLwindow.serverowerCase(),
            error.data.title,
            error.data.message
          );
        }
      }
    });
  };

  return (
    <Modal
      className='admin-console-unit-modal'
      show={props.show}
      onHide={props.showUserModal}
    >
      <Modal.Header className='admin-console-unit-modal-header' closeButton>
        <Modal.Title className='admin-console-unit-modal-body'>
          {context.intl.formatMessage({ id: 'perun.admin_console.choose_user', defaultMessage: 'perun.admin_console.choose_user' })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='admin-console-unit-modal-body'>
        <OrgSearch handleRowClick={handleRowClick} />
      </Modal.Body>
      <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

OrganizationalUnitModal.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(OrganizationalUnitModal);
