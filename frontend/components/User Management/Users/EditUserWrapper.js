import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager } from '../../../client'
import { ReactBootstrap } from '../../../elements'
const { Modal } = ReactBootstrap
import PasswordForm from '../MyProfile/PasswordForm'

const EditUserWrapper = (props, context) => {
    const [show, setShow] = useState(false)
    const generatePasswordForm = () => {
        const { formid } = props
        const formData = ComponentManager.getStateForComponent(
            formid,
            "formTableData"
        );
        return <PasswordForm isEdit={true} userInfo={{ username: formData?.['USER_NAME'] }} setShow={setShow} svSession={props.svSession} context={context} />
    }
    return (
        <>
            {props.children}
            <div className="my-profile-remove" onClick={() => setShow(true)}>
                <p>{context.intl.formatMessage({ id: 'perun.my_profile.change_password', defaultMessage: 'perun.my_profile.change_password' })}</p>
            </div>

            {show && (
                <Modal className='admin-console-unit-modal edit-user-password-modal' show={show} onHide={() => { setShow(false) }}>
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