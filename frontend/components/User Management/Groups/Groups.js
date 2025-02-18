import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../../client'
import { ReactBootstrap } from '../../../elements'
const { useEffect } = React
const { Modal } = ReactBootstrap
import { alertUserResponse } from '../../../elements'
import AssignAcl from '../../AdminConsole/AssignAcl'
// id cleanups
// development note: refresh grids,add group menagement
const Groups = (props, context) => {
    const [show, setShow] = useState(false)
    const [row, setRow] = useState(undefined)
    const [active, setActive] = useState('EDIT')
    const [hideControls, setHideControls] = useState(false)
    const [assignFlag, setAssignFlag] = useState(false)
    useEffect(() => {
        return () => {
            cleanUpGrids()
        }
    }, [])
    useEffect(() => {
        if (!assignFlag) {
            GridManager.reloadGridData('GROUP_ACL_GRID')
        }
    }, [assignFlag])

    const cleanUpGrids = () => {
        ComponentManager.cleanComponentReducerState('GROUP_MAIN_GRID');
        ComponentManager.cleanComponentReducerState('GROUP_MEMBERS_GRID');
        ComponentManager.cleanComponentReducerState('GROUP_ACL_GRID');
    }
    const handleRowClick = (_id, _rowIdx, row) => {
        setShow(true)
        setRow(row)
        setActive('EDIT')
        setHideControls(false)
    }
    const getTabClass = (tab) => (tab === active ? 'user-control active' : 'user-control');

    const generateForm = (tableName, objectId, gridId) => {
        return <GenericForm
            params={'READ_URL'}
            key={gridId}
            id={gridId}
            method={`/ReactElements/getTableJSONSchema/${props.svSession}/${tableName}`}
            uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${props.svSession}/${tableName}`}
            tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/${objectId}/${tableName}`}
            addSaveFunction={(e) => handleFormSave(e, gridId)}
            hideBtns={'closeAndDelete'}
            className={'form-test add-edit-users-form'}
        />
    }
    const handleFormSave = (e, gridId) => {
        axios({
            method: 'post',
            data: e.formData,
            url: `${window.server}/WsAdminConsole/saveUserGroup/${props.svSession}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(res => {
            alertUserResponse({ 'response': res })
            GridManager.reloadGridData('GROUP_MAIN_GRID')
            ComponentManager.setStateForComponent(gridId, null, {
                saveExecuted: false,
            });
            setShow(falsegridId)
        }).catch(err => {
            alertUserResponse({ 'response': err, alertType: 'error' })
        })
    }
    return (
        <>
            <div className='user-mng-users'>
                <div className='user-mng-grid'>
                    <ExportableGrid
                        gridType='READ_URL'
                        key={'GROUP_MAIN_GRID'}
                        id={'GROUP_MAIN_GRID'}
                        configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_USER_GROUPS`}
                        dataTableName={`/ReactElements/getTableData/${props.svSession}/SVAROG_USER_GROUPS/0`}
                        onRowClickFunct={handleRowClick}
                        refreshData={true}
                        toggleCustomButton={true}
                        customButton={() => {
                            setShow(true)
                            setHideControls(true)
                            setActive('ADD')
                        }}
                        customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
                        heightRatio={0.65}
                    />
                </div>
            </div>
            {show && (
                <Modal className='admin-console-unit-modal' show={show} onHide={() => { setShow(false), setActive('EDIT') }}>
                    <Modal.Header className='admin-console-unit-modal-header' closeButton>
                    </Modal.Header>
                    <Modal.Body className='admin-console-unit-modal-body'>
                        <div className='user-mng-dashboard user-mng'>
                            {!hideControls && <div className='user-dash-controls'>
                                <div className={getTabClass('EDIT')} onClick={() => { setActive('EDIT') }}>{context.intl.formatMessage({ id: 'perun.admin_console.group_edit', defaultMessage: 'perun.admin_console.group_edit' })}</div>
                                <div className={getTabClass('MEMBERS')} onClick={() => { setActive('MEMBERS') }}>{context.intl.formatMessage({ id: 'perun.admin_console.group_members', defaultMessage: 'perun.admin_console.group_members' })}</div>
                                <div className={getTabClass('PRIVILEGES')} onClick={() => { setActive('PRIVILEGES') }}>{context.intl.formatMessage({ id: 'perun.admin_console.group_privileges', defaultMessage: 'perun.admin_console.group_privileges' })}</div>
                            </div>}
                            <div className='user-dash-content'>
                                {active === 'ADD' && generateForm('SVAROG_USER_GROUPS', 0, 'GROUP_ADD_FORM')}
                                {active === 'EDIT' && generateForm('SVAROG_USER_GROUPS', row['SVAROG_USER_GROUPS.OBJECT_ID'], 'GROUP_MEMBERS_FORM')}
                                {active === 'MEMBERS' && <ExportableGrid
                                    key={'GROUP_MEMBERS_GRID'}
                                    id={'GROUP_MEMBERS_GRID'}
                                    gridType={'READ_URL'}
                                    configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_USERS`}
                                    dataTableName={`/WsAdminConsole/getLinkedUsers/${props.svSession}/${row['SVAROG_USER_GROUPS.OBJECT_ID']}`}
                                    minHeight={500}
                                    refreshData={true}
                                />}
                                {active === 'PRIVILEGES' && <ExportableGrid
                                    key={'GROUP_ACL_GRID'}
                                    id={'GROUP_ACL_GRID'}
                                    gridType={'READ_URL'}
                                    configTableName={`/WsAdminConsole/get-acl-by-group-field-list/sid/${props.svSession}`}
                                    dataTableName={`/WsAdminConsole/get-acl-by-group/sid/${props.svSession}/group_object_id/${row['SVAROG_USER_GROUPS.OBJECT_ID']}`}
                                    minHeight={500}
                                    refreshData={true}
                                    toggleCustomButton={true}
                                    customButton={() => {
                                        setAssignFlag(true)
                                    }}
                                    customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.assign_acl', defaultMessage: 'perun.admin_console.assign_acl' })}
                                />}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
                </Modal >
            )}
            {assignFlag && <AssignAcl setAssignFlag={setAssignFlag} groupType={row['SVAROG_USER_GROUPS.OBJECT_ID']} groupName={row['SVAROG_USER_GROUPS.GROUP_NAME']} />}
        </>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})

Groups.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Groups)