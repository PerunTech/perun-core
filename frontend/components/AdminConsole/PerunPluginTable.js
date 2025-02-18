
import React from 'react'
import { ComponentManager, ExportableGrid, GenericForm, GridManager, axios } from '../../client'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
const { useState, useEffect } = React;
import { alertUser, ReactBootstrap } from "../../elements";
import ConfigMenuWrapper from './ConfigMenuWrapper';
const { Modal } = ReactBootstrap;
const tableName = "SVAROG_PERUN_PLUGIN";
let gridId = `${tableName}_GRID`;
const PerunPluginTable = (props, context) => {
    const [show, setShow] = useState(false);
    const [objectId, setObjectId] = useState(undefined)

    useEffect(() => {
        return () => {
            ComponentManager.cleanComponentReducerState(gridId);
        }
    }, []);
    //handle infinite loading

    //edit on row click
    const handleRowClick = (_id, _rowIdx, row) => {
        setObjectId(row[`${'SVAROG_PERUN_PLUGIN'}.OBJECT_ID`] || 0)
        setShow(true)
    };
    //togglemodal
    const generatePluginTable = () => {
        const { svSession } = props;
        gridId = `${tableName}_GRID`;
        let grid = (
            <ExportableGrid
                gridType={"READ_URL"}
                key={gridId}
                id={gridId}
                configTableName={`/ReactElements/getTableFieldList/${svSession}/${tableName}`}
                dataTableName={
                    `/ReactElements/getTableData/${props.svSession}/${tableName}/0`}
                onRowClickFunct={handleRowClick}
                refreshData={true}
                toggleCustomButton={true}
                customButton={() => {
                    setShow(true)
                    setObjectId(0)
                }}
                customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}
                heightRatio={0.75}
                editContextFunc={handleRowClick}
            />
        );
        return grid
    };
    //create record
    const saveRecord = (e) => {
        const { svSession } = props;
        let url =
            window.server +
            `/ReactElements/createTableRecordFormData/${svSession}/${tableName}/0`;
        axios({
            method: "post",
            data: encodeURIComponent(JSON.stringify(e.formData)),
            url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
            .then((res) => {
                if (res.data) {
                    const resType = res.data.type.toLowerCase()
                    const title = res.data.title || ''
                    const msg = res.data.message || ''
                    alertUser(true, resType, title, msg)
                    GridManager.reloadGridData(gridId);
                    setShow(false);
                }
            })
            .catch(err => {
                console.error(err)
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg, () => ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
                    saveExecuted: false,
                }));

            });
    };
    //create record form
    const generatePluginForm = (objectId) => {
        const { svSession } = props;
        return <GenericForm
            params={"READ_URL"}
            key={`${tableName}_FORM`}
            id={`${tableName}_FORM`}
            method={`/ReactElements/getTableJSONSchema/${svSession}/${tableName}`}
            uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${tableName}`}
            tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${objectId}/${tableName}`}
            addSaveFunction={(e) => saveRecord(e)}
            hideBtns={objectId === 0 ? 'closeAndDelete' : 'close'}
            addDeleteFunction={deleteFunc}
            className={'admin-settings-forms'}
            inputWrapper={ConfigMenuWrapper}
        />
    };

    const deleteFunc = (_id, _action, _session, formData) => {
        const { svSession } = props;
        let url = window.server + `/ReactElements/deleteObject/${svSession}`;
        axios({
            method: "post",
            data: encodeURIComponent(formData[4]["PARAM_VALUE"]),
            url: url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
            .then((res) => {
                if (res.data.type === "SUCCESS") {
                    alertUser(true, "success", res.data.title, res.data.message);
                    setShow(false);
                    ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
                        saveExecuted: false,
                    });
                    ComponentManager.setStateForComponent(gridId, null, {
                        rowClicked: undefined,
                    });
                    GridManager.reloadGridData(gridId);
                }
            })
            .catch(err => {
                console.error(err)
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg, () => ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
                    saveExecuted: false,
                }));

            });
    };


    return (
        <>
            <div className='admin-console-grid-container'>
                <div className='admin-console-component-header'>
                    <p>{context.intl.formatMessage({ id: 'perun.admin_console.perun_plugin_table_editor', defaultMessage: 'perun.admin_console.perun_plugin_table_editor' })}</p>
                </div>
                {generatePluginTable()}
            </div>
            {show && <Modal className='admin-console-unit-modal' show={show} onHide={() => setShow(false)}>
                <Modal.Header className='admin-console-unit-modal-header' closeButton>
                    <Modal.Title>{context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='admin-console-unit-modal-body'>
                    {generatePluginForm(objectId)}
                </Modal.Body>
                <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
            </Modal>}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

PerunPluginTable.contextTypes = {
    intl: PropTypes.object.isRequired
}
export default connect(mapStateToProps)(PerunPluginTable);
