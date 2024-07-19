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
    const [data, setData] = useState({})
    const [key, setKey] = useState('')
    useEffect(() => {
        if (window.userObject) {
            axios.get(`${window.server}/WsConf/params/get/sys/SSO_POST_KEY`).then(res => {
                if (res.data) {
                    setKey(res.data['VALUE'])

                }
            })
            setData(window.userObject || {})
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.delete('userObject'); // Remove the userObject parameter
            const newURL = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}${window.location.hash}`;
            window.history.replaceState({}, document.title, newURL);
        }
    }, [])


    const submutSsoRegister = (e) => {
        let url = window.server + '/SvSecurity/sso'

        let data = new URLSearchParams()
        data.append(`${key}`, JSON.stringify(e.formData)
        )
        axios({
            method: "post",
            data,
            url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
            .then(function (response) {
                if (response.data.type === "SUCCESS") {
                    alertUser(true, "success", context.intl.formatMessage({ id: 'perun.admin_console.success_label', defaultMessage: 'perun.admin_console.success_label' }), "", () => {
                    });
                    GridManager.reloadGridData(prev);
                    setShow(false);
                }
            }).catch(err => {
                console.error(err)
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg);
            });
    }
    const renderForm = () => {
        const { uiSchema, schema, formData } = getRegisterSsoForm(context, data)
        return <Form
            uiSchema={uiSchema}
            schema={schema}
            key={'SVAROG_USERS_SSO'}
            formData={formData}
            className={`customForm form registration-form registration-form-sso`}
            validator={validator}
            onSubmit={submutSsoRegister}
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
