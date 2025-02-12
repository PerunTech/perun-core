import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../../client'
import { alertUser, alertUserV2, ReactBootstrap } from '../../../elements'
const { useEffect } = React
const { Modal } = ReactBootstrap

const UsersAddGroup = (props, context) => {
    const [show, setShow] = useState(true)

    useEffect(() => {
        return () => {
            ComponentManager.cleanComponentReducerState('USERS_ADD_GROUP_GRID');
        }
    }, [])

    const handleRowClick = (_id, _rowIdx, row) => {
        console.log(row);
        let url = `${window.server}/WsAdminConsole/updateUserGroup/${props.svSession}/${props.userId}/${row['SVAROG_USER_GROUPS.OBJECT_ID']}/add`
        axios.get(url).then(res => {
            console.log(res);
            setShow(false)
            props.setAddGroupFlag(false)
        })

    }

    return (
        <>
            {show && (
                <Modal className='admin-console-unit-modal' show={show} onHide={() => { setShow(false), props.setAddGroupFlag(false) }}>
                    <Modal.Header className='admin-console-unit-modal-header' closeButton>
                    </Modal.Header>
                    <Modal.Body className='admin-console-unit-modal-body'>
                        <div className='user-mng-dashboard user-mng'>
                            <div className='user-dash-content'>
                                <ExportableGrid
                                    key={'USER_ADD_GROUP_GRID'}
                                    id={'USER_ADD_GROUP_GRID'}
                                    gridType={'READ_URL'}
                                    configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_USER_GROUPS`}
                                    dataTableName={`/ReactElements/getTableData/${props.svSession}/SVAROG_USER_GROUPS/0`}
                                    minHeight={600}
                                    refreshData={true}
                                    onRowClickFunct={handleRowClick}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})

UsersAddGroup.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(UsersAddGroup)
