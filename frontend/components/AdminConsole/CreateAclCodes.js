import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
import { alertUser, GridManager } from '../../elements';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const CreateAclCodes = ({ svSession }, context) => {
  const [formData, setFormData] = useState({ aclCode: '', accessType: '' });

  const schema = {
    title: context.intl.formatMessage({ id: 'perun.admin_console.create_permission', defaultMessage: 'perun.admin_console.create_permission' }),
    type: 'object',
    required: ['aclCode', 'accessType'],
    properties: {
      accessType: {
        type: 'string',
        title: context.intl.formatMessage({ id: 'perun.admin_console.permission_type', defaultMessage: 'perun.admin_console.permission_type' }),
        enum: ['READ', 'MODIFY', 'NONE', 'WRITE', 'EXECUTE', 'FULL'],
      },
      aclCode: {
        type: 'string',
        title: context.intl.formatMessage({ id: 'perun.admin_console.code_control_guide', defaultMessage: 'perun.admin_console.code_control_guide' }),
        default: '',
      },
    },
  };

  const uiSchema = {
    aclCode: {
      'ui:widget': 'textarea',
      'ui:options': {
        rows: 4,
      },
    },
    accessType: {
      'ui:placeholder': context.intl.formatMessage({ id: 'perun.admin_console.choose_value', defaultMessage: 'perun.admin_console.choose_value' }),
    },
  };

  const handleSubmit = async ({ formData }) => {
    const { aclCode, accessType } = formData;

    if (!aclCode || !accessType) {
      alertUser(true, 'info', context.intl.formatMessage({ id: 'perun.admin_console.fill_inputs', defaultMessage: 'perun.admin_console.fill_inputs' }));
      return;
    }

    const restUrl = `${window.server}/WsAdminConsole/createCustomAcl/${svSession}`;
    const params = { aclCode, accessType };

    try {
      const response = await axios.post(restUrl, JSON.stringify(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data) {
        const { type, message } = response.data;
        if (type === 'SUCCESS') {
          setFormData({ aclCode: '', accessType: '' });
          GridManager.reloadGridData('SVAROG_ACL');
        }
        alertUser(true, type.toLowerCase(), message);
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.type && errorData?.message) {
        alertUser(true, errorData.type.toLowerCase(), errorData.message);
      }
    }
  };

  return (
    <div className="admin-console-acl-create">
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
  );
};

CreateAclCodes.contextTypes = {
  intl: PropTypes.object.isRequired,
};

CreateAclCodes.propTypes = {
  svSession: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

export default connect(mapStateToProps)(CreateAclCodes);
