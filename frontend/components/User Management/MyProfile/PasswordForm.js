import React, { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { iconManager } from '../../../assets/svg/svgHolder';
import { strcmp } from '../../../model/utils';
import swal from 'sweetalert';
import md5 from 'md5'
import { alertUserResponse, alertUserV2 } from '../../../elements';
import axios from 'axios';
const PasswordWidget = ({ value, onChange }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="my-profile-password-widget">
            <input
                type={visible ? 'text' : 'password'}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="my-profile-password-input"
            />
            <button
                type="button"
                className="my-profile-toggle-visibility"
                onClick={() => setVisible(!visible)}
            >
                {visible ? iconManager.getIcon('eyeHide') : iconManager.getIcon('eyeShow')}
            </button>
        </div>
    );
};



const widgets = {
    passwordWidget: PasswordWidget
};

const PasswordForm = (props) => {
    const [passwordMatch, setDontMatch] = useState(false)
    const [formDat, setDat] = useState({})

    const schema = {
        title: `${props.context.intl.formatMessage({ id: 'perun.my_profile.change_password', defaultMessage: 'perun.my_profile.change_password' })}`,
        type: 'object',
        properties: {
            oldPassword: {
                type: 'string',
                title: `${props.context.intl.formatMessage({ id: 'perun.my_profile.old_password', defaultMessage: 'perun.my_profile.old_password' })}`
            },
            userPassword: {
                type: 'string',
                title: `${props.context.intl.formatMessage({ id: 'perun.my_profile.password', defaultMessage: 'perun.my_profile.password' })}`
            },
            confUserPassword: {
                type: 'string',
                title: `${props.context.intl.formatMessage({ id: 'perun.my_profile.confirm_password', defaultMessage: 'perun.my_profile.confirm_password' })}`
            },
        },
        required: ['userPassword', 'confUserPassword', 'oldPassword']
    };

    const uiSchema = {
        userPassword: {
            'ui:widget': 'passwordWidget'
        },
        confUserPassword: {
            'ui:widget': 'passwordWidget'
        },
        oldPassword: {
            'ui:widget': 'passwordWidget'
        },
    };
    //post method, form with userName, oldPassword, userPassword, confUserPassword
    const handleSubmit = ({ formData }) => {
        swal.close()
        setDat(formData)
        let data = formData
        data.userName = props.userInfo.username
        data.userPassword = md5(data.userPassword).toUpperCase()
        data.confUserPassword = md5(data.confUserPassword).toUpperCase()
        data.oldPassword = md5(data.oldPassword).toUpperCase()
        if (strcmp(formData.confUserPassword, formData.userPassword)) {
            let url = window.server + `/WsAdminConsole/changePassword/${props.svSession}`
            axios({
                method: "post",
                data,
                url: url,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).then(res => {
                console.log(res);
                alertUserResponse({ 'response': res })
            }).catch(err => {
                alertUserResponse({ 'response': err })
            })

        } else setDontMatch(true)
    };

    return (

        <Form
            className='my-profile-change-password'
            validator={validator}
            schema={schema}
            uiSchema={uiSchema}
            widgets={widgets}
            onSubmit={handleSubmit}
            formData={formDat}
        >
            <div><p className='dont-match'>{passwordMatch ? `${props.context.intl.formatMessage({ id: 'perun.my_profile.password_dont', defaultMessage: 'perun.my_profile.password_dont' })}` : ''}</p></div>
            <div className='my-profile-alert-btns'>
                <div className='cancel-btn' onClick={() => swal.close()} >{props.context.intl.formatMessage({ id: 'perun.my_profile.cancel', defaultMessage: 'perun.my_profile.cancel' })}</div>
                <button className='btn btn-info' type='submit'>{props.context.intl.formatMessage({ id: 'perun.adminConsole.save', defaultMessage: 'perun.adminConsole.save' })}</button></div>
        </Form>
    );
};

export default PasswordForm;
