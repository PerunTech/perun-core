import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../client'
import { alertUser, ReactBootstrap } from '../../elements'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap
// development note: refresh grids,add group menagement
const Groups = (props, context) => {
    const [show, setShow] = useState(false)
    const [row, setRow] = useState(undefined)
    const [active, setActive] = useState('EDIT')
    useEffect(() => {
        return () => {
            ComponentManager.cleanComponentReducerState('SEARCH_GROUPS_GRID');
        }
    }, [])

    const handleRowClick = (_id, _rowIdx, row) => {
        setShow(true)
        setRow(row)
    }
    const getTabClass = (tab) => (tab === active ? 'user-control active' : 'user-control');

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
            hideBtns={'closeAndDelete'}
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
                        key={'SEARCH_GROUPS_GRID'}
                        id={'SEARCH_GROUPS_GRID'}
                        configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_USER_GROUPS`}
                        dataTableName={`/ReactElements/getTableData/${props.svSession}/SVAROG_USER_GROUPS/0`}
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
                                <div className={getTabClass('EDIT')} onClick={() => { setActive('EDIT') }}>Edit Group</div>
                                <div className={getTabClass('MEMBERS')} onClick={() => { setActive('MEMBERS') }}>Group Members</div>
                                <div className={getTabClass('PRIVILEGES')} onClick={() => { setActive('PRIVILEGES') }}>Group Privileges</div>
                            </div>
                            <div className='user-dash-content'>
                                {active === 'EDIT' && generateForm('SVAROG_USER_GROUPS', row['SVAROG_USER_GROUPS.OBJECT_ID'])}
                                {active === 'PRIVILEGES' && <ExportableGrid
                                    key={'testid'}
                                    id={'testid'}
                                    gridType={'READ_URL'}
                                    configTableName={`/WsAdminConsole/get-acl-by-group-field-list/sid/${props.svSession}`}
                                    dataTableName={`/WsAdminConsole/get-acl-by-group/sid/${props.svSession}/group_object_id/${row['SVAROG_USER_GROUPS.OBJECT_ID']}`}
                                    minHeight={500}
                                    refreshData={true}
                                />}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
                </Modal >
            )}
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
