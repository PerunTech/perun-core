import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../../client'
import { alertUser, alertUserV2, ReactBootstrap } from '../../../elements'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap
import ReactDOM from 'react-dom'
import { alertUserResponse } from '../../../elements'
import PasswordForm from '../MyProfile/PasswordForm'
import md5 from 'md5';
const EditUserWrapper = (props, context) => {
    const [show, setShow] = useState(false)
    const [username, setUsername] = useState(undefined)
    const generatePasswordForm = () => {
        const { formid } = props
        const formData = ComponentManager.getStateForComponent(
            formid,
            "formTableData"
        );
        console.log(formData?.['USER_NAME']);
        return <PasswordForm isEdit={true} userInfo={{ username: formData?.['USER_NAME'] }} svSession={props.svSession} context={context} />
    }
    return (
        <>
            {props.children}
            <div className="my-profile-remove" onClick={() => setShow(true)}>
                <p>{context.intl.formatMessage({ id: 'perun.my_profile.change_password', defaultMessage: 'perun.my_profile.change_password' })}</p>
            </div>

            {show && (
                <Modal className='admin-console-unit-modal' show={show} onHide={() => { setShow(false) }}>
                    <Modal.Header className='admin-console-unit-modal-header' closeButton>
                    </Modal.Header>
                    <Modal.Body className='admin-console-unit-modal-body'>
                        <div className='user-mng-dashboard user-mng edit-user-wrapper'>
                            {generatePasswordForm()}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
                </Modal>
            )}
        </>
    )
}
const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})
EditUserWrapper.contextTypes = {
    intl: PropTypes.object.isRequired
}
export default connect(mapStateToProps)(EditUserWrapper)