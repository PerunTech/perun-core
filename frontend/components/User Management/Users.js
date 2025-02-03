import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../client'
import { alertUser, ReactBootstrap } from '../../elements'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap
// development note: refresh grids,add group menagement
const Users = (props, context) => {
    const [show, setShow] = useState(false)
    const [row, setRow] = useState(undefined)
    const [active, setActive] = useState('EDIT')

    useEffect(() => {
        return () => {
            ComponentManager.cleanComponentReducerState('SEARCH_USERS_GRID');
        }
    }, [])

    const handleRowClick = (_id, _rowIdx, row) => {
        setShow(true)
        setRow(row)
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
                alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message)
            }).catch(err => {
                // setLoading(false)
                console.error(err)
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg);
            });
        }, () => { }, true, 'yessss', 'nooo')
    }
    const generateForm = (tableName, objectId, search) => {
        let classNames = search ? 'user-mng-form hide-all-form-legends' : 'form-test'
        return <GenericForm
            params={'READ_URL'}
            key={`${tableName}_SEARCH_FORM`}
            id={`${tableName}_SEARCH_FORM`}
            method={`/ReactElements/getTableJSONSchema/${props.svSession}/${tableName}`}
            uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${props.svSession}/${tableName}`}
            tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/${objectId}/${tableName}`}
            addSaveFunction={(e) => console.log(e)}
            hideBtns={'all'}
            className={classNames}
        />
    }
    return (
        <>
            <div className='user-mng-users'>
                <div className='user-mng-search'>
                    {generateForm('FLOCK', 0, true)}
                </div>
                <div className='user-mng-grid'>
                    <ExportableGrid
                        gridType='READ_URL'
                        key={'SEARCH_USERS_GRID'}
                        id={'SEARCH_USERS_GRID'}
                        configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_USERS`}
                        dataTableName={`/ReactElements/getTableData/${props.svSession}/SVAROG_USERS/0`}
                        onRowClickFunct={handleRowClick}
                        refreshData={true}
                        toggleCustomButton={true}
                        customButton={() => {
                        }}
                        customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
                        heightRatio={0.55}
                    />
                </div>
            </div>
            {show && (
                <Modal className='admin-console-unit-modal' show={show} onHide={() => { setShow(false), setActive('EDIT') }}>
                    <Modal.Header className='admin-console-unit-modal-header' closeButton>
                    </Modal.Header>
                    <Modal.Body className='admin-console-unit-modal-body'>
                        <div className='user-mng-dashboard user-mng'>
                            <div className='user-dash-controls'>
                                <div className={getTabClass('EDIT')} onClick={() => { setActive('EDIT') }}>Edit User</div>
                                <div className={'user-control'} onClick={() => changeUserStatus()}>Change Status</div>
                                <div className={getTabClass('GROUP')} onClick={() => { setActive('GROUP') }}>Change user Group</div>
                                <div className={getTabClass('PRIVILEGES')} onClick={() => { setActive('PRIVILEGES') }}>Show privileges</div>
                            </div>
                            <div className='user-dash-content'>
                                {active === 'EDIT' && generateForm('SVAROG_USERS', row['SVAROG_USERS.OBJECT_ID'])}
                                {active === 'PRIVILEGES' && <ExportableGrid
                                    key={'testid'}
                                    id={'testid'}
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
