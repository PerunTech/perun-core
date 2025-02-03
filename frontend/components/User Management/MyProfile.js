import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../client'
import { alertUser, ReactBootstrap } from '../../elements'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap
import { iconManager } from '../../assets/svg/svgHolder'
// development note: refresh grids,add group menagement
const MyProfile = (props, context) => {
    return (
        <>
            <div className='my-profile'>
                <div className='my-profile-form-container'>

                    <div className='my-profile-icon-holder'>
                        <div className='my-profile-avatar'><p className='my-profile-title-large'>User avatar</p>
                            <p>You can change your avatar here or remove the current avatar.</p></div>
                        <div className='my-profile-icon'>{iconManager.getIcon('currentUserIcon')}</div>
                        <div className='my-profile-upload'>
                            <p className='my-profile-title-medium'>Upload new avatar</p>
                            <input type="file" />
                            <p className='my-profile-title-small'>The maximum file size allowed is 200KB.</p>
                            <div className='my-profile-remove'><p>Remove avatar</p></div>
                        </div>
                    </div>


                    <div className='my-profile-edit'> <p className='my-profile-title-large '>Edit Profile </p>   <div className='my-profile-remove'><p>Change password</p></div></div>
                    <GenericForm
                        params={'READ_URL'}
                        key={`FORM`}
                        id={`FORM`}
                        method={`/ReactElements/getTableJSONSchema/${props.svSession}/SVAROG_USERS`}
                        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${props.svSession}/SVAROG_USERS`}
                        tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/${props.userInfo.userObjectId}/SVAROG_USERS`}
                        addSaveFunction={(e) => console.log(e)}
                        hideBtns={'closeAndDelete'}
                        className={'hide-all-form-legends my-profile-form'}
                    />
                </div>
            </div >
        </>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
    userInfo: state.userInfo,
})

MyProfile.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(MyProfile)
