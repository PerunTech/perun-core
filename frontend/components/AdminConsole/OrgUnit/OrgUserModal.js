import React, { useState } from "react";
import { connect } from "react-redux";
import { alertUser, alertUserResponse, ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import axios from "axios";
import { GridManager, PropTypes } from "../../../client";
import OrgSearch from "./OrgSearch";
import { Loading } from '../../ComponentsIndex';

const OrgUserModal = (props, context) => {
  const [loading, setLoading] = useState(false)
  const handleRowClick = (_id, _rowIdx, row) => {
    alertUser(
      true,
      "info",
      context.intl.formatMessage({ id: 'perun.admin_console.add_user', defaultMessage: 'perun.admin_console.add_user' }),
      context.intl.formatMessage({ id: 'perun.admin_console.svarog_unit_add_user', defaultMessage: 'perun.admin_console.svarog_unit_add_user' }),
      () => { saveApp(row) },
      () => { },
      true,
      context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' }),
      context.intl.formatMessage({ id: 'perun.admin_console.cancel', defaultMessage: 'perun.admin_console.cancel' })
    );
  };

  const saveApp = (row) => {
    setLoading(true)
    let objecidUser = row['SVAROG_USERS.OBJECT_ID']
    let url = window.server + `/WsAdminConsole/get/assignUserToOU/sid/${props.svSession}/objectIdOU/${props.objectIdOU}/objecidUser/${objecidUser}`
    axios.get(url).then((res) => {
      alertUserResponse({ response: res })
      setLoading(false)
      props.setAddUserFlag(false)
      GridManager.reloadGridData('ORG_USER_GRID')
    }).catch((error) => {
      alertUserResponse({ response: error })
      setLoading(false)
    });
  };

  return (<>
    {loading && <Loading />}
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
    </Modal></>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

OrgUserModal.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(OrgUserModal);
