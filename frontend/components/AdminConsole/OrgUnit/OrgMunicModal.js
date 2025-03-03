import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GridManager, axios } from '../../../client'
import { alertUserResponse, ReactBootstrap } from '../../../elements'
const { useEffect } = React
const { Modal } = ReactBootstrap

const OrgMunicModal = (props) => {

    useEffect(() => {
        return () => {
            ComponentManager.cleanComponentReducerState('ADD_MUNIC_GRID');
        }
    }, [])

    const handleRowClick = (_id, _rowIdx, row) => {
        let url = `${window.server}/WsAdminConsole/updateUserGroup/${props.svSession}/${props.userId}/${row['SVAROG_USER_GROUPS.OBJECT_ID']}/add`
        axios.get(url).then(res => {
            GridManager.reloadGridData('USER_GROUP_GRID')
            alertUserResponse({ response: res })
            props.setAddGroupFlag(false)
        }).catch(err => {
            alertUserResponse({ response: err, type: 'error' })
        })

    }

    return (
        <>
            {props.addMunicFlag && (
                <Modal className='admin-console-unit-modal' show={props.addMunicFlag} onHide={() => { props.setAddMunicFlag(false) }}>
                    <Modal.Header className='admin-console-unit-modal-header' closeButton>
                    </Modal.Header>
                    <Modal.Body className='admin-console-unit-modal-body'>
                        <div className='user-mng-dashboard user-mng'>
                            <div className='user-dash-content'>
                                <ExportableGrid
                                    key={'ADD_MUNIC_GRID'}
                                    id={'ADD_MUNIC_GRID'}
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

OrgMunicModal.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(OrgMunicModal)
