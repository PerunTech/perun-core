import React, { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { iconManager } from '../../../assets/svg/svgHolder';
import { strcmp } from '../../../model/utils';
import swal from 'sweetalert';

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

const validate = (formData, errors) => {
    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword.addError('Passwords do not match');
    }
    return errors;
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
            password: {
                type: 'string',
                title: `${props.context.intl.formatMessage({ id: 'perun.my_profile.password', defaultMessage: 'perun.my_profile.password' })}`
            },
            confirmPassword: {
                type: 'string',
                title: `${props.context.intl.formatMessage({ id: 'perun.my_profile.confirm_password', defaultMessage: 'perun.my_profile.confirm_password' })}`
            },
        },
        required: ['password', 'confirmPassword']
    };

    const uiSchema = {
        password: {
            'ui:widget': 'passwordWidget'
        },
        confirmPassword: {
            'ui:widget': 'passwordWidget'
        }
    };

    const handleSubmit = ({ formData }) => {
        setDat(formData)
        if (strcmp(formData.password, formData.confirmPassword)) {
            swal.close()
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
