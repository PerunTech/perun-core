import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, axios } from '../../../client'
import { alertUserResponse } from '../../../elements'
import PasswordForm from '../MyProfile/PasswordForm'
import md5 from 'md5';
const AddUserWrapper = (props, context) => {
    const onSave = (data) => {
        const { formid } = props
        const formData = ComponentManager.getStateForComponent(
            formid,
            "formTableData"
        );


        formData['PASSWORD_HASH'] = md5(data.userPassword).toUpperCase()
        formData['CONFIRM_PASSWORD_HASH'] = md5(data.confUserPassword).toUpperCase()
        const url = `${window.server}/WsAdminConsole/saveUser/${props.svSession}`
        axios.post(url, formData, { headers: { "Content-Type": "application/x-www-form-urlencoded" } })
            .then(res => {
                alertUserResponse({ response: res })
                const afterSaveCleanUp = ComponentManager.getStateForComponent(
                    formid,
                    "afterSaveCleanUp"
                );
                afterSaveCleanUp()
            })
            .catch(err => alertUserResponse({ response: err, alertType: 'error' }));
    }
    return (
        <>
            {props.children}
            <PasswordForm context={context} svSession={props.svSession} isNewUser={true} onSave={onSave} />
        </>
    )
}
const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})
AddUserWrapper.contextTypes = {
    intl: PropTypes.object.isRequired
}
export default connect(mapStateToProps)(AddUserWrapper)