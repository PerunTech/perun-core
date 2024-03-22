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

  const saveApp = (row) => {
    let objecidUser = row['SVAROG_USERS.OBJECT_ID']
    let url = window.server + `/WsAdminConsole/get/assignUserToOU/sid/${props.svSession}/objectIdOU/${props.objectIdOU}/objecidUser/${objecidUser}`
    axios.get(url).then((res) => {
      const resType = res.data.type?.toLowerCase() || 'info'
      const title = res.data.title || ''
      const msg = res.data.message || ''
      alertUser(true, resType, title, msg)
      if (resType === "success") {
        GridManager.reloadGridData(`USER_UNIT_GRID_${props.objectIdOU}`)
      }
    }).catch((error) => {
      const title = error.response?.data?.title || error
      const msg = error.response?.data?.message || ''
      alertUser(true, 'error', title, msg)
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
