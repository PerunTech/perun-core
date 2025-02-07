import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../../client'
import { alertUser, ReactBootstrap } from '../../../elements'
import CreateAclCodes from '../../AdminConsole/CreateAclCodes'
const { useReducer, useEffect } = React
const { Modal } = ReactBootstrap
// development note: refresh grids,add group menagement
// id cleanups
const Privileges = (props, context) => {
    const [show, setShow] = useState(false)
    const [row, setRow] = useState(undefined)
    const [active, setActive] = useState('EDIT')
    useEffect(() => {
        return () => {
            ComponentManager.cleanComponentReducerState('SVAROG_ACL_GRID');
        }
    }, [])

    const handleRowClick = (_id, _rowIdx, row) => {
        setShow(true)
        setRow(row)
    }

    const generateForm = (tableName, objectId, search) => {
        let classNames = search ? 'user-mng-form hide-all-form-legends' : 'form-test'
        return <GenericForm
            params={'READ_URL'}
            key={`${tableName}_${objectId}_FORM`}
            id={`${tableName}_${objectId}_FORM`}
            method={`/ReactElements/getTableJSONSchema/${props.svSession}/${tableName}`}
            uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${props.svSession}/${tableName}`}
            tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/${objectId}/${tableName}`}
            addSaveFunction={(e) => console.log(e)}
            hideBtns={'all'}
            className={classNames}
            disabled
        />
    }
    return (
        <>
            <div className='user-mng-users'>
                <div className='user-mng-grid'>
                    <ExportableGrid
                        gridType='READ_URL'
                        key={'SVAROG_ACL_GRID'}
                        id={'SVAROG_ACL_GRID'}
                        configTableName={`/ReactElements/getTableFieldList/${props.svSession}/SVAROG_ACL`}
                        dataTableName={`/ReactElements/getTableData/${props.svSession}/SVAROG_ACL/0`}
                        onRowClickFunct={handleRowClick}
                        refreshData={true}
                        toggleCustomButton={true}
                        customButton={() => {
                            setShow(true)
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
                            <div className='user-dash-content'>
                                {active === 'EDIT' && generateForm('SVAROG_ACL', row['SVAROG_ACL.OBJECT_ID'])}
                                {active === 'ADD' && <CreateAclCodes />}
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

Privileges.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Privileges)
