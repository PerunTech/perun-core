import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../../client'
import { alertUser, alertUserV2, ReactBootstrap } from '../../../elements'
const { useEffect } = React
const { Modal } = ReactBootstrap
import ReactDOM from 'react-dom'
import { alertUserResponse } from '../../../elements'
import UsersAddGroup from './UsersAddGroup'
import AddUserWrapper from './AddUserWrapper'
import EditUserWrapper from './EditUserWrapper'
import Swal from 'sweetalert2'
const Users = (props, context) => {
    const [show, setShow] = useState(false)
    const [row, setRow] = useState(undefined)
    const [active, setActive] = useState('EDIT')
    const [hideControls, setHideControls] = useState(false)
    const [addGroupFlag, setAddGroupFlag] = useState(false)
    const [usersData, setUsersData] = useState(undefined)
    useEffect(() => {
        refreshGrid()
        return () => {
            cleanUpGrids()
        }
    }, [])

    const refreshGrid = () => {
        setUsersData(false)
        ComponentManager.cleanComponentReducerState('USERS_MAIN_GRID');
        axios.get(`${window.server}/ReactElements/getTableData/${props.svSession}/SVAROG_USERS/100/PKID`).then(res => {
            setUsersData(res.data)
        }).catch(err => alertUserResponse({ response: err }));
    }
    const cleanUpGrids = () => {
        ComponentManager.cleanComponentReducerState('USERS_MAIN_GRID');
        ComponentManager.cleanComponentReducerState('USER_GROUP_GRID');
        ComponentManager.cleanComponentReducerState('USERS_ACL_GRID');
    }
    const generateForm = (tableName, objectId, formType, gridId) => {
        let inputWrapper = null;
        let classNames = '';
        let label = '';
        let method = '';

        switch (formType) {
            case 'search':
                classNames = 'admin-console-search-from hide-all-form-legends';
                label = context.intl.formatMessage({ id: 'perun.generalLabel.search', defaultMessage: 'perun.generalLabel.search' });
                method = `/ReactElements/getTableSearchJSONSchema/${props.svSession}/${tableName}`;
                break;
            case 'add':
                inputWrapper = AddUserWrapper;
                classNames = 'form-test add-edit-users-form add-user-wrapper';
                label = context.intl.formatMessage({ id: 'perun.admin_console.save', defaultMessage: 'perun.admin_console.save' });
                method = `/ReactElements/getTableJSONSchema/${props.svSession}/${tableName}`;
                break;
            case 'edit':
                inputWrapper = EditUserWrapper;
                classNames = 'form-test add-edit-users-form edit-user-wrapper';
                label = context.intl.formatMessage({ id: 'perun.admin_console.save', defaultMessage: 'perun.admin_console.save' });
                method = `/ReactElements/getTableJSONSchema/${props.svSession}/${tableName}`;
                break;
            default:
                return null;
        }

        const saveFunction = formType === 'search' ? searchData : handleSave;

        return (
            <GenericForm
                params="READ_URL"
                key={gridId}
                id={gridId}
                method={method}
                uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${props.svSession}/${tableName}`}
                tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/${objectId}/${tableName}`}
                addSaveFunction={(e) => saveFunction(e, gridId)}
                hideBtns="closeAndDelete"
                className={classNames}
                inputWrapper={inputWrapper}
                afterSaveCleanUp={() => { refreshGrid(); setShow(false); }}
                customSaveButtonName={label}
                customSave
            />
        );
    };

    const searchData = (e, gridId) => {
        const url = `${window.server}/WsAdminConsole/searchUsers/${props.svSession}`
        axios({
            method: "post",
            data: e.formData,
            url: url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then(res => {
            cleanUpGrids()
            setUsersData(undefined)
            setUsersData(res.data)
            ComponentManager.setStateForComponent(gridId, null, {
                saveExecuted: false,
            });
        }).catch(err => {
            alertUserResponse({ response: err, alertType: 'error' })
        })
    }
    const handleSave = (e, gridId) => {
        let url = `${window.server}/WsAdminConsole/editUser/${props.svSession}/${row['SVAROG_USERS.OBJECT_ID']}`
        axios({
            method: "post",
            data: encodeURIComponent(JSON.stringify(e.formData)),
            url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((res) => {
            alertUserResponse({ response: res })
            refreshGrid()
            ComponentManager.setStateForComponent(gridId, null, {
                saveExecuted: false,
            });
        }).catch(err => {
            alertUserResponse({ response: err, alertType: 'error' })
            refreshGrid()
            ComponentManager.setStateForComponent(gridId, null, {
                saveExecuted: false,
            });
        });
    };
    const handleRowClick = (_id, _rowIdx, row) => {
        setShow(true)
        setRow(row)
        setActive('EDIT')
        setHideControls(false)
    }
    const getTabClass = (tab) => (tab === active ? 'user-control active' : 'user-control');
    const changeUserStatus = () => {
        const initialStatus = row['SVAROG_USERS.STATUS']
        const objectId = row['SVAROG_USERS.OBJECT_ID']
        const status = initialStatus === "VALID" ? 'INVALID' : 'VALID'
        let label = context.intl.formatMessage({ id: `perun.admin_console.user_change_status_${status.toLocaleLowerCase()}`, defaultMessage: `perun.admin_console.user_change_status_${status.toLocaleLowerCase()}` })
        let question = `${context.intl.formatMessage({ id: 'perun.admin_console.user_change_status', defaultMessage: 'perun.admin_console.user_change_status' })}`
        alertUser(true, 'info', question, label, () => {
            const url = `${window.server}/WsAdminConsole/changeUserStatus/${props.svSession}/${objectId}/${status}`
            axios.get(url).then(res => {
                alertUserResponse({ response: res })
                refreshGrid()
            }).catch(err => alertUserResponse({ response: err, alertType: 'error' }));
        }, () => { }, true, context.intl.formatMessage({ id: 'perun.admin_console.yes', defaultMessage: 'perun.admin_console.yes' }), context.intl.formatMessage({ id: 'perun.admin_console.no', defaultMessage: 'perun.admin_console.no' }))
    }
    const generateGroupContorls = (_id, _rowIdx, row) => {
        const customElement = document.createElement('div')
        ReactDOM.render(<div className='add-edit-users-form group-controls'>
            <button className='btn-success btn_save_form' onClick={() => removeGroup(row)}>{context.intl.formatMessage({ id: 'perun.admin_console.remove', defaultMessage: 'perun.admin_console.remove' })}</button>
            <button className='btn-success btn_save_form' onClick={() => setBasicGroup(row)}>{context.intl.formatMessage({ id: 'perun.admin_console.basic_group', defaultMessage: 'perun.admin_console.basic_group' })}</button>
            <button className='cancel-btn' onClick={() => Swal.close()}>{context.intl.formatMessage({ id: 'perun.my_profile.cancel', defaultMessage: 'perun.my_profile.cancel' })}</button>
        </div>, customElement)
        return customElement
    }
    const setBasicGroup = (gridRow) => {
        const url = `${window.server}/WsAdminConsole/addDefaultUserGroup/${props.svSession}/${row['SVAROG_USERS.OBJECT_ID']}/${gridRow['SVAROG_USER_GROUPS.OBJECT_ID']}/true`
        axios.get(url).then(res => {
            alertUserResponse({ response: res })
            GridManager.reloadGridData('USER_GROUP_GRID')
        }).catch(err => alertUserResponse({ response: err, alertType: 'error' }));
    }
    const removeGroup = (gridRow) => {
        const url = `${window.server}/WsAdminConsole/updateUserGroup/${props.svSession}/${row['SVAROG_USERS.OBJECT_ID']}/${gridRow['SVAROG_USER_GROUPS.OBJECT_ID']}/remove`
        axios.get(url).then(res => {
            alertUserResponse({ response: res })
            GridManager.reloadGridData('USER_GROUP_GRID')
        }).catch(err => alertUserResponse({ response: err, alertType: 'error' }));
    }
    return (
        <>
            <div className='user-mng-users'>
                <div className='user-mng-search'>
                    {generateForm('SVAROG_USERS', 0, 'search', 'USERS_SEARCH_FORM')}
                </div>
                {usersData && <div className='user-mng-grid'>
                    <ExportableGrid
                        gridType='SEARCH_GRID_DATA'
                        key={'USERS_MAIN_GRID'}
                        id={'USERS_MAIN_GRID'}
                        configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_USERS`}
                        dataTableName={usersData}
                        onRowClickFunct={handleRowClick}
                        refreshData={true}
                        toggleCustomButton={true}
                        customButton={() => {
                            setShow(true)
                            setHideControls(true)
                            setActive('ADD')
                        }}
                        customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
                        heightRatio={0.55}
                    />
                </div>}
            </div>
            {show && (
                <Modal className='admin-console-unit-modal' show={show} onHide={() => { setShow(false), setActive('EDIT') }}>
                    <Modal.Header className='admin-console-unit-modal-header' closeButton>
                    </Modal.Header>
                    <Modal.Body className='admin-console-unit-modal-body'>
                        <div className='user-mng-dashboard user-mng'>
                            {/* USER DASH CONTROLS */}
                            {!hideControls && <div className='user-dash-controls'>
                                <div className={getTabClass('EDIT')} onClick={() => { setActive('EDIT'), cleanUpGrids() }}>{context.intl.formatMessage({ id: 'perun.user_mng.edit_user', defaultMessage: 'perun.user_mng.edit_user' })}</div>
                                <div className={'user-control'} onClick={() => changeUserStatus()}>{context.intl.formatMessage({ id: 'perun.user_mng.chg_status', defaultMessage: 'perun.user_mng.chg_status' })}</div>
                                <div className={getTabClass('GROUP')} onClick={() => { setActive('GROUP'), cleanUpGrids() }}>{context.intl.formatMessage({ id: 'perun.user_mng.chg_user_group', defaultMessage: 'perun.user_mng.chg_user_group' })}</div>
                                <div className={getTabClass('PRIVILEGES')} onClick={() => { setActive('PRIVILEGES'), cleanUpGrids() }}>{context.intl.formatMessage({ id: 'perun.user_mng.show_privileges', defaultMessage: 'perun.user_mng.show_privileges' })}</div>
                            </div>}
                            {/* RENDER ACTIVE*/}
                            <div className='user-dash-content'>
                                {/* ADD USER */}
                                {active === 'ADD' && generateForm('SVAROG_USERS', 0, 'add', 'USERS_ADD_FORM')}
                                {active === 'EDIT' && generateForm('SVAROG_USERS', row['SVAROG_USERS.OBJECT_ID'], 'edit', 'USERS_EDIT_FORM')}
                                {active === 'GROUP' && <ExportableGrid
                                    key={'USER_GROUP_GRID'}
                                    id={'USER_GROUP_GRID'}
                                    gridType={'READ_URL'}
                                    configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_USER_GROUPS`}
                                    dataTableName={`/WsAdminConsole/getLinkedGroups/${props.svSession}/${row['SVAROG_USERS.OBJECT_ID']}`}
                                    minHeight={500}
                                    refreshData={true}
                                    toggleCustomButton={true}
                                    customButton={() => {
                                        setAddGroupFlag(true)
                                    }}
                                    customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add_group', defaultMessage: 'perun.admin_console.add_group' })}
                                    onRowClickFunct={(_id, _rowIdx, row) => alertUserV2({
                                        html: generateGroupContorls(_id, _rowIdx, row),
                                        allowOutsideClick: true
                                    })}
                                />}
                                {active === 'PRIVILEGES' && <ExportableGrid
                                    key={'USERS_ACL_GRID'}
                                    id={'USERS_ACL_GRID'}
                                    gridType={'READ_URL'}
                                    configTableName={`/WsAdminConsole/get-acl-by-user-field-list/sid/${props.svSession}`}
                                    dataTableName={`/WsAdminConsole/get-acl-by-user/sid/${props.svSession}/user_object_id/${row['SVAROG_USERS.OBJECT_ID']}`}
                                    minHeight={500}
                                    refreshData={true}
                                />}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
                </Modal>
            )}
            {addGroupFlag && <UsersAddGroup addGroupFlag={addGroupFlag} setAddGroupFlag={setAddGroupFlag} userId={row['SVAROG_USERS.OBJECT_ID']} />}
        </>
    )

}
const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})
Users.contextTypes = {
    intl: PropTypes.object.isRequired
}
export default connect(mapStateToProps)(Users)