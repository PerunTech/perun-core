import React, { useState, useEffect } from "react";
import {
    ComponentManager,
    ExportableGrid,
    GridManager,
    GenericForm,
    PropTypes,
} from "./../../../../client";
import Form from '@rjsf/core';
import { connect } from "react-redux";
import { alertUser, ReactBootstrap } from "./../../../../elements";
const { Modal } = ReactBootstrap;
import axios from "axios";
import validator from '@rjsf/validator-ajv8';
import getRegisterSsoForm from './RegisterSsoForm';

const RegistrationSso = (props, context) => {
    const labels = context.intl
    const renderForm = () => {
        const { uiSchema, schema, formData } = getRegisterSsoForm(context)
        return <Form
            uiSchema={uiSchema}
            schema={schema}
            key={'SVAROG_USERS_SSO'}
            formData={formData}
            className={`customForm form registration-form registration-form-sso`}
            validator={validator}
            onSubmit={(e) => {
                console.log(e);
            }}
        >
            <></>
            <div className='admin-console-label-form-btn-container'>
                <button className='btn-success btn_save_form' type="submit">
                    {context.intl.formatMessage({ id: 'perun.login.register', defaultMessage: 'perun.login.register' })}
                </button>
            </div>
        </Form>
    }
    return (
        <React.Fragment>
            <div className='linkFormHolder'>
                <div className='admin-console-register-sso'>
                    {renderForm()}
                </div>
            </div>
        </React.Fragment>
    );
};

RegistrationSso.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default RegistrationSso;
