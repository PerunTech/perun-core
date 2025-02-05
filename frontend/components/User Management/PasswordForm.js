import React, { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { iconManager } from '../../assets/svg/svgHolder';
import { strcmp } from '../../model/utils';
import swal from 'sweetalert';
const schema = {
    title: 'Password Form',
    type: 'object',
    properties: {
        password: {
            type: 'string',
            title: 'Password'
        },
        confirmPassword: {
            type: 'string',
            title: 'Confirm Password'
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
            validate={validate}
            onSubmit={handleSubmit}
            formData={formDat}
        >
            <div><p className='dont-match'>{passwordMatch ? 'Passwords dont match' : ''}</p></div>
            <div className='my-profile-alert-btns'>
                <button className='btn btn-info cancel' onClick={() => swal.close()} type='button'>Cancel</button>
                <button className='btn btn-info' type='submit'>Submit</button></div>
        </Form>
    );
};

export default PasswordForm;
