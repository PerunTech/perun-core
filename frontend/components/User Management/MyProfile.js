import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GenericForm, axios, createHashHistory } from '../../client';
import { iconManager } from '../../assets/svg/svgHolder';
import { downloadFile } from '../../functions/utils';
import { alertUser } from '../../elements';
import ReactDOM from 'react-dom';
import { store } from '../../model';
import PasswordForm from './PasswordForm';

const MyProfile = (props) => {
    const history = createHashHistory()
    const [img, setImg] = useState(undefined);
    useEffect(() => {
        if (props.userInfo.avatar) {
            downloadFile(props.userInfo.avatar, props.svSession, setImg)
        }
    }, []);

    const previewAndUpload = (file) => {
        const fileReader = new FileReader()
        fileReader.onloadend = () => {
            const customElement = document.createElement('div')
            ReactDOM.render(<div className='my-profile-preview-img'>
                <img src={fileReader.result} />
            </div>, customElement)
            alertUser(true, '', '', '', () => { uploadFile(file) }, () => { }, true, 'set new Avatar', 'cancel', false, '', false, customElement)
        }
        fileReader.readAsDataURL(file)
    }

    const handlePhotoSelection = (e) => {
        const largerThan15MbLabel = 'file to large'
        const notAPhotoLabel = 'not a photo'
        const photoHeadersArr = ['89504e47', '47494638', 'ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8']
        e.preventDefault()
        const selectedFiles = []

        Object.values(e.target.files).forEach(file => {
            // Check if the selected file is not larger than 200kb
            if ((file.size / 1024).toFixed(2) < 200) {
                selectedFiles.push(file)

                let header = ''

                const fileReader = new FileReader()
                fileReader.onloadend = e => {
                    let arr = (new Uint8Array(e.target.result)).subarray(0, 4)
                    for (let i = 0; i < arr.length; i++) {
                        header += arr[i].toString(16)
                    }
                    if (header && photoHeadersArr.includes(header)) {
                        previewAndUpload(file)
                        // This will reset the header variable, so it doesn't just keep appending the headers onto each other
                        header = ''
                    } else {
                        alertUser(true, 'info', notAPhotoLabel)
                    }
                }
                fileReader.readAsArrayBuffer(file)

            } else {
                alertUser(true, 'info', largerThan15MbLabel)
            }
        })
    }

    const deleteDownload = (e) => {
        alertUser(true, 'warning', 'Remove current avatar', '', () => {

            e.preventDefault()
            let deleteObj = { 'OBJECT_ID': props.userInfo.avatar['objectId'], 'OBJECT_TYPE': 2 }
            let url = window.server + `/ReactElements/deleteObject/${props.svSession}`
            axios({
                method: "post",
                data: deleteObj,
                url: url,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            })
                .then((res) => {
                    alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message)
                    if (res.data.type === 'SUCCESS') {
                        setImg(undefined)
                        let tempUserInfo = props.userInfo
                        tempUserInfo.avatar.objectId = undefined
                        store.dispatch({ type: 'GET_CURRENT_USER_DATA', payload: tempUserInfo })
                    }
                }).catch(err => {
                    console.error(err)
                    const title = err.response?.data?.title || err
                    const msg = err.response?.data?.message || ''
                    alertUser(true, "error", title, msg);
                });
        }, () => { }, true, 'confirm', 'cancel', false, '', false)

    }

    const uploadFile = (file) => {
        const data = new FormData();
        data.append('file', file);
        axios({
            method: 'post',
            data: data,
            url: `${window.server}/ReactElements/uploadAvatar/sid/${props.svSession}`,
        })
            .then(res => {
                let tempUserInfo = props.userInfo
                tempUserInfo.avatar.objectId = res.data.data.objectId
                store.dispatch({ type: 'GET_CURRENT_USER_DATA', payload: tempUserInfo })
                downloadFile(tempUserInfo.avatar, props.svSession, setImg)
                alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message)
            })
            .catch(err => {
                console.error('Upload error:', err);
            });
    }

    const changePassword = () => {
        const customElement = document.createElement('div')
        ReactDOM.render(<PasswordForm />, customElement)
        alertUser(true, '', '', '', () => { }, () => { }, true, 'set new Avatar', 'cancel', false, '', false, customElement, true)
    }
    return (
        <div className="my-profile">
            <div className="my-profile-form-container">
                <div className="my-profile-icon-holder">
                    <div className="my-profile-avatar">
                        <p className="my-profile-title-large">User avatar</p>
                        <p>You can change your avatar here or remove the current avatar.</p>
                    </div>
                    <div className="my-profile-icon">
                        {img ? <img className="my-profile-icon-avatar" src={img} alt="User Avatar" /> : iconManager.getIcon('currentUserIcon')}
                    </div>
                    <div className="my-profile-upload">
                        <p className="my-profile-title-medium">Upload new avatar</p>
                        {/* <input type="file" onChange={handleUploadedFiles} /> */}
                        <input type="file" onChange={handlePhotoSelection} />
                        <p className="my-profile-title-small">The maximum file size allowed is 200KB.</p>
                        <div onClick={(e) => deleteDownload(e)} className="my-profile-remove">
                            <p>Remove avatar</p>
                        </div>
                    </div>
                </div>
                <div className="my-profile-edit">
                    <p className="my-profile-title-large">Edit Profile</p>
                    <div className="my-profile-remove" onClick={() => changePassword()}>
                        <p>Change password</p>
                    </div>
                </div>
                <GenericForm
                    params="READ_URL"
                    key="FORM"
                    id="FORM"
                    method={`/ReactElements/getTableJSONSchema/${props.svSession}/SVAROG_USERS`}
                    uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${props.svSession}/SVAROG_USERS`}
                    tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/${props.userInfo.userObjectId}/SVAROG_USERS`}
                    addSaveFunction={(e) => console.log(e)}
                    hideBtns="closeAndDelete"
                    className="hide-all-form-legends my-profile-form"
                />
                <div className='my-profile-back-btn' onClick={() => { history.goBack(), console.log('log') }}><div className='my-profile-back-btn-icon'> <i className='fas fa-chevron-left' /></div><p>Back</p></div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
    userInfo: state.userInfo,
});

MyProfile.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(MyProfile);
