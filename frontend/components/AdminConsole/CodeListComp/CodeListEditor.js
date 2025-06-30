import React, { useState, useEffect } from "react";
import { ComponentManager, ExportableGrid, GridManager, Loading, PropTypes } from "../../../client";
import { connect } from "react-redux";
import { alertUserResponse, ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import axios from "axios";
import CodeListFormSchema from "./CodeListFormSchema";
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
let prevId

const CodeListEditor = (props, context) => {
    const [show, setShow] = useState(false)
    const [innerGrid, setInnerGrid] = useState(undefined)
    const [addChildForm, setAddChildForm] = useState(undefined)
    const [editChildForm, setEditForm] = useState(undefined)
    const [prevO, setPrevo] = useState([0])
    const [arrOP, setArrOP] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        generateInnerGrid(null, null)
        return () => {
            ComponentManager.cleanComponentReducerState(prevId);
            prevId = ""
        }
    }, [])

    const generateInnerGrid = (data, parentC) => {
        const { svSession } = props
        ComponentManager.cleanComponentReducerState(prevId);
        const gridId = 'CODES_GRID_' + Math.floor(Math.random() * 999999).toString(36)
        prevId = gridId
        let dataWs = `/ReactElements/getTableData/${svSession}/SVAROG_CODES/0`
        let heightRatio = 0.75
        if (data) {
            dataWs = `/ReactElements/getObjectsByParentId/${svSession}/${data}/SVAROG_CODES/0`
            heightRatio = 0.35
        }
        const grid = (
            <ExportableGrid
                gridType={"READ_URL"}
                key={gridId}
                id={gridId}
                configTableName={`/ReactElements/getTableFieldList/${svSession}/SVAROG_CODES`}
                dataTableName={dataWs}
                defaultHeight={false}
                heightRatio={heightRatio}
                refreshData={true}
                onRowClickFunct={handleRowClick}
                toggleCustomButton={true}
                customButton={() => generateAddChildForm(parentC)}
                customButtonLabel={context.intl.formatMessage({ id: 'perun.admin_console.add_code_list_editor', defaultMessage: 'perun.admin_console.add_code_list_editor' })}
            />
        );
        setInnerGrid(grid)
    }

    const handleRowClick = (_id, _rowIdx, row) => {
        let prevobj = prevO
        let arrOfParents = arrOP
        prevobj.push(row['SVAROG_CODES.OBJECT_ID'])
        arrOfParents.push(row['SVAROG_CODES.CODE_VALUE'])
        setPrevo(prevobj)
        setArrOP(arrOfParents)
        generateEditForm(row['SVAROG_CODES.OBJECT_ID'])
        generateInnerGrid(row['SVAROG_CODES.OBJECT_ID'], row['SVAROG_CODES.CODE_VALUE'])
    }

    const generateAddChildForm = (parentC, edit) => {
        if (!edit) {
            setShow(true)
        }
        const { schema } = CodeListFormSchema(context);
        renderAddChildForm(schema, parentC, edit)
    };

    const renderAddChildForm = (schema, parentC, edit) => {
        let formData = {}
        let uiSchema = {}
        if (parentC) {
            formData = {
                PARENT_CODE_VALUE: parentC
            }
        }
        if (edit) {
            formData = edit

        }
        if (prevO[prevO?.length - 1] !== 0) {
            uiSchema = {
                PARENT_CODE_VALUE: { "ui:readonly": true }
            }
        }
        const form = (
            <Form
                key={'SVAROG_CODES_EDIT'}
                uiSchema={uiSchema}
                validator={validator}
                schema={schema}
                formData={formData}
                className={`form-test label-form code-list-form ${edit && 'code-list-edit-form'}`}
                onSubmit={(e) => {
                    submitCodeList(e, edit)
                }}
            >
                <></>
                <div className='admin-console-code-list-btn-holder'>
                    <div className='admin-console-label-form-btn-container'>
                        <button className={`btn-success btn_save_form`} type="submit">
                            {context.intl.formatMessage({ id: 'perun.generalLabel.save', defaultMessage: 'perun.generalLabel.save' })}
                        </button>
                    </div>
                    {edit && edit['PARENT_ID'] !== 0 && (
                        <div className='admin-console-label-form-btn-container'>
                            <button className='btn-success btn_save_form admin-console-code-list-remove-btn' type="button" onClick={() => deleteFunc(edit)}>
                                {context.intl.formatMessage({ id: 'perun.generalLabel.delete', defaultMessage: 'perun.generalLabel.delete' })}
                            </button>
                        </div>
                    )}
                </div>
            </Form>
        )
        if (edit) {
            setEditForm(form)
        }
        setAddChildForm(form)
    }

    const deleteFunc = (edit) => {
        setLoading(true)
        let restUrl = window.server + '/ReactElements/deleteObject/' + props.svSession + '/false/false'
        axios({
            method: 'post',
            data: JSON.stringify(edit),
            url: restUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            setLoading(false)
            if (res?.data) {
                alertUserResponse({ response: res.data, onConfirm: () => backButton() })
                GridManager.reloadGridData(prevId)
            }
        }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
        })
    }

    const submitCodeList = (e, edit) => {
        setLoading(true)
        const { svSession } = props;
        let data = {
            'SVAROG_CODES': {
                'CODE_VALUE': e.formData['CODE_VALUE'], 'PARENT_CODE_VALUE': e.formData['PARENT_CODE_VALUE'], 'LABEL_CODE': e.formData['LABEL_CODE'],
                'SORT_ORDER': e.formData['SORT_ORDER'], ...edit && { 'PKID': e.formData['PKID'], 'OBJECT_ID': e.formData['OBJECT_ID'] }
            },
            'SVAROG_LABELS': { 'LABEL_TEXT': e.formData['LABEL_TEXT'], 'LOCALE_ID': e.formData['LOCALE_ID'], ' LABEL_DESCR': e.formData['LABEL_DESCR'] }
        }
        let url =
            window.server + `/WsAdminConsole/save-code-list/sid/${svSession}/parent_id/${edit ? edit['PARENT_ID'] : prevO[prevO?.length - 1]}`

        axios({
            method: "post",
            data: JSON.stringify(data),
            url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((res) => {
            setLoading(false)
            if (res?.data) {
                const resType = res.data?.type?.toLowerCase() || 'info'
                alertUserResponse({ response: res.data })
                if (resType === 'success') {
                    GridManager.reloadGridData(prevId);
                    setShow(false);
                }
            }
        }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
        })
    };

    const backButton = () => {
        let prevobj = prevO
        let arrOfParents = arrOP
        prevobj?.pop()
        setPrevo(prevobj)
        arrOfParents?.pop()
        setArrOP(arrOfParents)
        generateInnerGrid(prevobj[prevobj?.length - 1], arrOfParents[arrOfParents?.length - 1])
        generateEditForm(prevobj[prevobj?.length - 1])
    }
    const generateEditForm = (objid) => {
        let url = window.server + `/ReactElements/getTableFormData/${props.svSession}/${objid}/SVAROG_CODES`
        axios.get(url).then(res => {
            generateAddChildForm(null, res.data)
        })
    }
    return (
        <React.Fragment>
            {loading && <Loading />}
            <div className='admin-console-component-header'>
                <p>{context.intl.formatMessage({ id: 'perun.admin_console.codelist_editor', defaultMessage: 'perun.admin_console.codelist_editor' })}</p>
            </div>
            <div className='admin-console-code-list-content-holder'>
                {prevO?.length > 1 && <legend className='admin-console-code-list-legend admin-console-legend'>{context.intl.formatMessage({ id: 'perun.admin_console.change_code_list', defaultMessage: 'perun.admin_console.change_code_list' })} {arrOP[arrOP?.length - 1]}</legend>}
                {prevO?.length > 1 && editChildForm}
                {innerGrid}
                {prevO?.length > 1 && (
                    <button className='btn_save_form admin-console-code-list-back-btn' onClick={backButton}>
                        {context.intl.formatMessage({ id: 'perun.admin_console.back_button', defaultMessage: 'perun.admin_console.back_button' })}
                    </button>
                )}
            </div>
            <Modal
                className='admin-console-unit-modal'
                show={show}
                onHide={() => {
                    setShow(!show)
                }}
            >
                <Modal.Header className='admin-console-unit-modal-header' closeButton>
                </Modal.Header>
                <Modal.Body className='admin-console-unit-modal-body'>
                    {addChildForm}
                </Modal.Body>
                <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
            </Modal>
        </React.Fragment>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

CodeListEditor.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(CodeListEditor);
