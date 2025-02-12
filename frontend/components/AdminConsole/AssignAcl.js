import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import { alertUser, GridManager, ReactBootstrap } from '../../elements';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const { Modal } = ReactBootstrap;

const AssignAcl = (props, context) => {
  const [formData, setFormData] = useState({ actionType: '', aclList: '', groupType: '' });
  const [allGroups, setAllGroups] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (props.groupType) {
      setFormData(prev => ({ ...prev, groupType: props.groupType.toString() }));
      setAllGroups([{ groupName: props.groupName, objectId: props.groupType.toString() }]);
    } else {
      getAllGroups();
    }
  }, []);

  const getAllGroups = async () => {
    const url = `${window.server}/WsAdminConsole/getAllGroups/${props.svSession}`;
    try {
      const response = await axios.get(url);
      if (response.data?.data) {
        setAllGroups(response.data.data);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.type) {
        alertUser(true, error.response.data.type.toLowerCase(), error.response.data.message);
      }
    }
  };

  const schema = {
    title: context.intl.formatMessage({ id: 'perun.admin_console.assign_permission', defaultMessage: 'Assign ACL Permission' }),
    type: 'object',
    required: ['actionType', 'aclList', 'groupType'],
    properties: {
      actionType: {
        type: 'string',
        title: context.intl.formatMessage({ id: 'perun.admin_console.manage_permission', defaultMessage: 'Manage Permission' }),
        enum: ['REVOKE', 'GRANT'],
      },
      groupType: {
        type: 'string',
        title: context.intl.formatMessage({ id: 'perun.admin_console.group_name', defaultMessage: 'Group Name' }),
        enum: allGroups.map(group => group.objectId),
        enumNames: allGroups.map(group => group.groupName),
      },
      aclList: {
        type: 'string',
        title: context.intl.formatMessage({ id: 'perun.admin_console.code_control_guide', defaultMessage: 'ACL Codes' }),
      },
    },
  };

  const uiSchema = {
    aclList: {
      'ui:widget': 'textarea',
      'ui:options': {
        rows: 4,
      },
    },
  };

  const handleSubmit = async ({ formData }) => {
    const { actionType, aclList, groupType } = formData;

    if (!actionType || !aclList || !groupType) {
      alertUser(true, 'info', context.intl.formatMessage({ id: 'perun.admin_console.fill_inputs', defaultMessage: 'Please fill in all required fields' }));
      return;
    }

    const postUrl = `${window.server}/WsAdminConsole/manageCustomAcl/${props.svSession}`;
    const params = { manage: actionType, aclCode: aclList, groupObjId: groupType };

    try {
      const response = await axios.post(postUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data) {
        const { type, message } = response.data;
        alertUser(true, type.toLowerCase(), message);
        if (type === 'SUCCESS') {
          setFormData({ actionType: '', aclList: '', groupType: '' });
          props.setAssignFlag(false)
        }
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.type && errorData?.message) {
        alertUser(true, errorData.type.toLowerCase(), errorData.message);
      }
    }
  };

  return (
    <>
      {show && (
        <Modal className='admin-console-unit-modal' show={show} onHide={() => { setShow(false); props.setAssignFlag(false); }}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton />
          <Modal.Body className='admin-console-unit-modal-body'>
            <div className='user-mng-dashboard user-mng'>
              <div className='user-dash-content'>
                <Form
                  validator={validator}
                  schema={schema}
                  uiSchema={uiSchema}
                  formData={formData}
                  onChange={(e) => setFormData(e.formData)}
                  onSubmit={handleSubmit}
                  className='create-acl-form'
                />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

AssignAcl.contextTypes = {
  intl: PropTypes.object.isRequired,
};

AssignAcl.propTypes = {
  svSession: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

export default connect(mapStateToProps)(AssignAcl);