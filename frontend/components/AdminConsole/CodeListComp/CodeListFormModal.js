import React, { useState, useEffect } from 'react';
import { GenericForm, Loading, axios } from "../../../client";
import { ReactBootstrap, alertUserResponse } from "../../../elements";
const { Modal } = ReactBootstrap;
import Icon from '../../../elements/util/Icon';
import { TABLE_NAME, LABELS_TABLE_NAME, COMBINED_FORM_ID } from './utils';

const extract = (res) => {
    const d = res?.data;
    if (!d || typeof d !== 'object') return {};
    return (d.data && typeof d.data === 'object') ? d.data : d;
};

const CodeListFormModal = ({ show, objectId, parentCodeValue, svSession, fmt, onHide, onSave, onDelete, breadcrumb }) => {
    const [mergedData, setMergedData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!show || !svSession) return;

        const controller = new AbortController();
        const { signal } = controller;

        const fetchFormData = async () => {
            setMergedData(null);
            setLoading(true);
            try {
                const [codesSchemaRes, codesUiRes, codesDataRes, labelsSchemaRes, labelsUiRes, labelsDataRes] = await Promise.all([
                    axios.get(`${window.server}/ReactElements/getTableJSONSchema/${svSession}/${TABLE_NAME}`, { signal }),
                    axios.get(`${window.server}/ReactElements/getTableUISchema/${svSession}/${TABLE_NAME}`, { signal }),
                    axios.get(`${window.server}/ReactElements/getTableFormData/${svSession}/${objectId}/${TABLE_NAME}`, { signal }),
                    axios.get(`${window.server}/ReactElements/getTableJSONSchema/${svSession}/${LABELS_TABLE_NAME}`, { signal }),
                    axios.get(`${window.server}/ReactElements/getTableUISchema/${svSession}/${LABELS_TABLE_NAME}`, { signal }),
                    axios.get(`${window.server}/ReactElements/getTableFormData/${svSession}/0/${LABELS_TABLE_NAME}`, { signal }),
                ]);
                const codes = {
                    schema: extract(codesSchemaRes),
                    uiSchema: extract(codesUiRes),
                    formData: extract(codesDataRes),
                };
                const labels = {
                    schema: extract(labelsSchemaRes),
                    uiSchema: extract(labelsUiRes),
                    formData: extract(labelsDataRes),
                };
                setMergedData({
                    schema: {
                        type: 'object',
                        properties: {
                            codes: {
                                type: 'object',
                                title: codes.schema.title,
                                properties: codes.schema.properties || {},
                                required: codes.schema.required || [],
                            },
                            labels: {
                                type: 'object',
                                title: labels.schema.title,
                                properties: Object.fromEntries(
                                    Object.entries(labels.schema.properties || {}).filter(([k]) => k !== 'LABEL_CODE')
                                ),
                                required: [],
                            },
                        },
                    },
                    uiSchema: {
                        codes: parentCodeValue
                            ? { ...codes.uiSchema, PARENT_CODE_VALUE: { ...(codes.uiSchema.PARENT_CODE_VALUE || {}), 'ui:disabled': true } }
                            : codes.uiSchema,
                        labels: labels.uiSchema,
                    },
                    formData: {
                        codes: parentCodeValue
                            ? { ...(codes.formData || {}), PARENT_CODE_VALUE: parentCodeValue }
                            : (codes.formData || {}),
                        labels: labels.formData || {},
                    },
                });
            } catch (err) {
                if (err.code === 'ERR_CANCELED') return;
                console.error(err);
                alertUserResponse({ response: err });
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
        return () => controller.abort();
    }, [show, objectId, svSession, parentCodeValue]);

    const handleCombinedSave = (e) => {
        onSave(e.formData?.codes || {}, e.formData?.labels || {});
    };

    return (
        <Modal className='admin-console-unit-modal' show={show} onHide={onHide}>
            <Modal.Header className='admin-console-unit-modal-header' closeButton>
                <Modal.Title>
                    {objectId === 0
                        ? fmt('perun.admin_console.create_code_list')
                        : fmt('perun.admin_console.edit_code_list')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className='admin-console-unit-modal-body'>
                {breadcrumb && breadcrumb.length > 0 && (
                    <div className='admin-console-modal-breadcrumb'>
                        <span className='admin-console-modal-breadcrumb-icon'>
                            <Icon name='IconFolderOpen' size={14} />
                        </span>
                        {breadcrumb.map((crumb, idx) => (
                            <React.Fragment key={crumb.objectId}>
                                {idx > 0 && <span className='admin-console-modal-breadcrumb-sep'>/</span>}
                                <span className={idx === breadcrumb.length - 1 ? 'admin-console-modal-breadcrumb-crumb-current' : 'admin-console-modal-breadcrumb-crumb'}>
                                    {crumb.codeValue}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                )}
                {loading && <Loading />}
                {mergedData && (
                    <GenericForm
                        params="FORM_DATA"
                        key={`${COMBINED_FORM_ID}_${objectId}`}
                        id={COMBINED_FORM_ID}
                        method={mergedData.schema}
                        uiSchemaConfigMethod={mergedData.uiSchema}
                        tableFormDataMethod={mergedData.formData}
                        addSaveFunction={handleCombinedSave}
                        addDeleteFunction={onDelete}
                        hideBtns={objectId === 0 ? 'closeAndDelete' : 'close'}
                        className='code-list-form'
                    />
                )}
            </Modal.Body>
            <Modal.Footer className='admin-console-unit-modal-footer' />
        </Modal>
    );
};

export default CodeListFormModal;
