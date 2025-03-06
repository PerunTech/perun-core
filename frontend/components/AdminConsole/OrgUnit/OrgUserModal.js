import React from "react";
import { connect } from "react-redux";
import { alertUserResponse, alertUserV2, ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import axios from "axios";
import { GridManager, PropTypes } from "../../../client";
import OrgSearch from "./OrgSearch";

const OrgUserModal = (props, context) => {
  const handleRowClick = (_id, _rowIdx, row) => {
    const title = context.intl.formatMessage({ id: 'perun.admin_console.add_user', defaultMessage: 'perun.admin_console.add_user' })
    const message = context.intl.formatMessage({ id: 'perun.admin_console.svarog_unit_add_user', defaultMessage: 'perun.admin_console.svarog_unit_add_user' })
    const confirm = context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })
    const cancel = context.intl.formatMessage({ id: 'perun.admin_console.cancel', defaultMessage: 'perun.admin_console.cancel' })
    alertUserV2({
      type: 'info',
      title,
      message,
      confirmButtonText: confirm,
      onConfirm: () => assignUser(row),
      showCancel: true,
      cancelButtonText: cancel
    })
  };

  const assignUser = (row) => {
    const objecidUser = row['SVAROG_USERS.OBJECT_ID']
    const url = window.server + `/WsAdminConsole/get/assignUserToOU/sid/${props.svSession}/objectIdOU/${props.objectIdOU}/objecidUser/${objecidUser}`
    axios.get(url).then((res) => {
      if (res?.data) {
        const resType = res.data.type?.toLowerCase() || 'info'
        alertUserResponse({ response: res.data })
        if (resType === "success") {
          props.setAddUserFlag(false)
          GridManager.reloadGridData('ORG_USER_GRID')
        }
      }
    }).catch((err) => {
      console.error(err)
      alertUserResponse({ response: err.response?.data })
    });
  };

  return (
    <Modal
      className='admin-console-unit-modal'
      show={props.addUserFlag}
      onHide={() => props.setAddUserFlag(false)}
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

OrgUserModal.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(OrgUserModal);
