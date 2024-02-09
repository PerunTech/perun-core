import React, { useState, useEffect } from "react";
import {
    ComponentManager,
    ExportableGrid,
    GridManager,
    PropTypes,
} from "../../../client";
import Form from '@rjsf/core';
import { connect } from "react-redux";
import { alertUser, ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import axios from "axios";
import LabelSearchSchema from "./LabelSearchSchema"
import LabelFormSchema from "./LabelFormSchema"
import validator from '@rjsf/validator-ajv8';
let prev
const LabelEditor = (props, context) => {
    const [grid, setGrid] = useState(undefined)
    const [show, setShow] = useState(false)
    const [add, setAdd] = useState(undefined)
    const [form, setForm] = useState(undefined)
    const [formAdd, setFormAdd] = useState(undefined)
    const [formEdit, setFormEdit] = useState(undefined)
    useEffect(() => {
        generateSearchForm();
        return () => {
            ComponentManager.cleanComponentReducerState(prev)
        }
    }, [])

    //SearchForm
    const generateSearchForm = () => {
        const { schema, uiSchema } = LabelSearchSchema(context);
        renderForm(schema, uiSchema)
    }
    const renderForm = (schema, uiSchema) => {
        let form = <Form
            uiSchema={uiSchema}
            schema={schema}
            key={'SVAROG_LABELS_SEARCH'}
            className={`form-test label-form-search`}
            validator={validator}
            onSubmit={(e) => {
                ComponentManager.cleanComponentReducerState(prev)
                generateLabelsGrid(e.formData)
            }}
        >
            <></>
            <div className='admin-console-label-search-btn-container'>
                <button className='btn-success btn_save_form' type="button" onClick={() => addLabel()}>
                    {context.intl.formatMessage({ id: 'perun.admin_console.create_label', defaultMessage: 'perun.admin_console.create_label' })}
                </button>
                <button className='btn-success btn_save_form' type="submit">
                    {context.intl.formatMessage({ id: 'perun.admin_console.search_button', defaultMessage: 'perun.admin_console.search_button' })}
                </button>
            </div>
        </Form>
        setForm(form)
    }
    //Label Grid
    const generateLabelsGrid = (data) => {
        const { svSession } = props;
        const gridId = 'LABELS_GRID_' + Math.floor(Math.random() * 999999).toString(36)
        prev = gridId
        let tablename = 'SVAROG_LABELS'
        let grid = (
            <ExportableGrid
                gridType={"READ_URL"}
                key={gridId}
                id={gridId}
                configTableName={`/ReactElements/getTableFieldList/${svSession}/SVAROG_LABELS`}
                dataTableName={`/ReactElements/getTableWithLike/${svSession}/${tablename}/${data['SEARCH_OPTION']}/${data['SEARCH_VALUES']}/1`}
                defaultHeight={false}
                heightRatio={0.5}
                refreshData={true}
                onRowClickFunct={editLabel}
                minHeight={500}
            />
        );
        setGrid(grid);
    };
    //add new label button
    const addLabel = () => {
        setShow(true)
        setAdd(true)
        generateLabelForm()
    }
    //Label add new label form
    const generateLabelForm = () => {
        const { schema, uiSchema } = LabelFormSchema(context)
        let form = (
            <Form
                key={'SVAROG_LABELS_ADD'}
                uiSchema={uiSchema}
                schema={schema}
                className={`form-test label-form`}
                validator={validator}
                onSubmit={(e) => {
                    submitLabel(e)
                }}
            >
                <></>
                <div className='admin-console-label-search-btn-container'>
                    <button className='btn-success btn_save_form' type="submit">
                        {context.intl.formatMessage({ id: 'perun.adminConsole.save', defaultMessage: 'perun.adminConsole.save' })}
                    </button>
                </div>
            </Form>
        );
        setFormAdd(form);
    };
    //row click to edit label
    const editLabel = (_rowIdx, _id, row) => {
        setShow(true)
        setAdd(false)
        generateEditLabel(row['SVAROG_LABELS.OBJECT_ID'])
    }

    //Edit label form
    const generateEditLabel = (objid) => {
        let url =
            window.server +
            `/ReactElements/getTableFormData/${props.svSession}/${objid}/SVAROG_LABELS`;
        axios.get(url).then((res) => {
            const { schema, uiSchema } = LabelFormSchema(context);
            renderEditForm(schema, uiSchema, res.data)
        }).catch(err => {
            alertUser(true, 'error', err.data.title, err.data.message)
        })
    };
    const renderEditForm = (schema, uiSchema, formData) => {
        let form = <Form
            uiSchema={uiSchema}
            schema={schema}
            key={'SVAROG_LABELS_EDIT'}
            formData={formData}
            className={`form-test label-form`}
            validator={validator}
            onSubmit={(e) => {
                submitLabel(e)
            }}
        >
            <></>
            <div className='admin-console-label-form-btn-container'>
                <button className='btn-success btn_save_form' type="submit">
                    {context.intl.formatMessage({ id: 'perun.admin_console.search_button', defaultMessage: 'perun.admin_console.search_button' })}
                </button>
                <button className='btn-danger btn_delete_form' onClick={() => {
                    deleteLabel(formData)
                }} type="button">
                    {context.intl.formatMessage({ id: 'perun.generalLabel.delete', defaultMessage: 'perun.generalLabel.delete' })}
                </button>
            </div>
        </Form>
        setFormEdit(form)
    }
    //save label
    const submitLabel = (e) => {
        const { svSession } = props;
        let tableName = 'SVAROG_LABELS'
        let data = e.formData;
        let url =
            window.server +
            `/ReactElements/createTableRecordFormData/${svSession}/${tableName}/0`;
        axios({
            method: "post",
            data,
            url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
            .then(function (response) {
                if (response.data.type === "SUCCESS") {
                    alertUser(true, "success", context.intl.formatMessage({ id: 'perun.admin_console.success_label', defaultMessage: 'perun.admin_console.success_label' }), "", () => {
                    });
                    GridManager.reloadGridData(prev);
                    setShow(false);
                }
            })
            .catch(err => {
                alertUser(true, 'error', err.data.title, err.data.message)
            })
    };
    //delete label
    const deleteLabel = (formData) => {
        const { svSession } = props
        let url = window.server + '/ReactElements/deleteObject/' + svSession + '/false/false'
        axios({
            method: 'post',
            data: formData,
            url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(res => {
            alertUser(true, res.data.type.toLowerCase(), res.data.message)
            setShow(false)
            GridManager.reloadGridData(prev)
        }).catch(err => {
            alertUser(true, 'error', err.data.title, err.data.message)
        })
    }

    return (
        <React.Fragment>
            <div className='admin-console-label-editor-div'>
                <div>{form}</div>
                <div>
                    {grid}
                </div>
            </div>

            <Modal
                className='admin-console-unit-modal'
                show={show}
                onHide={() => setShow(!show)}
            >
                <Modal.Header className='admin-console-unit-modal-header' closeButton>
                </Modal.Header>
                <Modal.Body className='admin-console-unit-modal-body'>
                    {add ? formAdd : formEdit}
                </Modal.Body>
                <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
            </Modal>
        </React.Fragment>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

LabelEditor.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(LabelEditor);
