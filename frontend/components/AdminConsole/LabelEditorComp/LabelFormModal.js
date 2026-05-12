import React from "react";
import { GenericForm } from "../../../client";
import { ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import { TABLE_NAME, FORM_ID } from './utils';

const LabelFormModal = ({ show, objectId, svSession, fmt, onHide, onSave, onDelete }) => (
    <Modal className='admin-console-unit-modal' show={show} onHide={onHide}>
        <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>
                {objectId === 0
                    ? fmt('perun.admin_console.add_label')
                    : fmt('perun.admin_console.edit_label')}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body className='admin-console-unit-modal-body'>
            <GenericForm
                params="READ_URL"
                key={`${FORM_ID}_${objectId}`}
                id={FORM_ID}
                method={`/ReactElements/getTableJSONSchema/${svSession}/${TABLE_NAME}`}
                uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${TABLE_NAME}`}
                tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${objectId}/${TABLE_NAME}`}
                addSaveFunction={onSave}
                addDeleteFunction={onDelete}
                hideBtns={objectId === 0 ? 'closeAndDelete' : 'close'}
                className='form-test label-form'
            />
        </Modal.Body>
        <Modal.Footer className='admin-console-unit-modal-footer' />
    </Modal>
);

export default LabelFormModal;
