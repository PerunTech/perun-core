import React from 'react';
import { ReactBootstrap, alertUser, ComponentManager } from '../../elements';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import JsonView from 'react-json-view';
import { isJSON } from '../../functions/utils';
const { useState, useEffect } = React;
const { Modal } = ReactBootstrap;
const CofigMenuWrapper = (props, context) => {
    const [show, setShow] = useState(false);
    const [shouldRender, setRender] = useState(false)
    const [fieldJson, setFieldJson] = useState({})
    const [editedJson, setJson] = useState(undefined)
    useEffect(() => {
        changeField()
    }, [])


    const handleInput = () => {
        const firstInput = document.getElementById("root_MENU_CONF");
        if (firstInput) {
            firstInput.addEventListener("click", openJsonEditor);
            firstInput.style.cursor = "pointer"
        }
    }

    const changeField = () => {
        const { formid } = props
        const jsonSchema = ComponentManager.getStateForComponent(
            formid,
            "formData"
        );
        const uiSchema = ComponentManager.getStateForComponent(
            formid,
            "uischema"
        );


        if (jsonSchema) {
            uiSchema['MENU_CONF'] = { "ui:readonly": true }
            delete jsonSchema.properties['MENU_CONF'].format
            ComponentManager.setStateForComponent(formid, "formData", jsonSchema);
            props.formInstance.setState({ formData: jsonSchema });
            ComponentManager.setStateForComponent(formid, "uischema", uiSchema);
            props.formInstance.setState({ uischema: uiSchema });
            setRender(true)
        }
    }

    const openJsonEditor = () => {
        const { formid } = props
        const formData = ComponentManager.getStateForComponent(
            formid,
            "formTableData"
        );
        if (isJSON(formData['MENU_CONF'])) {
            setFieldJson(JSON.parse(formData['MENU_CONF']))
        }
        setShow(true)

    }

    const jsonManipulation = (obj) => {
        setJson(obj['updated_src'])
    }
    const changeJson = () => {
        const { formid } = props
        const formData = ComponentManager.getStateForComponent(
            formid,
            "formTableData"
        );
        formData['MENU_CONF'] = JSON.stringify(editedJson)
        ComponentManager.setStateForComponent(formid, "formTableData", formData);
        props.formInstance.setState({ formTableData: formData });
        alertUser(true, "info", "perun.admin_console.change_json")
    }
    return (
        <>
            {shouldRender &&
                <>
                    {props.children}
                    {props.children && handleInput()}
                </>


            }
            {show && (
                <Modal
                    className='admin-console-unit-modal menu-editor-modal'
                    show={show}
                    onHide={() => { setShow(false) }}>
                    <Modal.Header className='admin-console-unit-modal-header  menu-editor-header' closeButton>
                    </Modal.Header>
                    <Modal.Body className='admin-console-unit-modal-body  menu-editor-body'>
                        <div>
                            <JsonView src={fieldJson} onEdit={jsonManipulation} onAdd={jsonManipulation} onDelete={jsonManipulation} />
                            <div>
                                <button type='button' className='btn-success btn_save_form' onClick={() => { editedJson && changeJson() }}>{context.intl.formatMessage({ id: 'perun.admin_console.config_menu_confirm', defaultMessage: 'perun.admin_console.config_menu_confirm' })}</button>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className='admin-console-unit-modal-footer  menu-editor-footer'></Modal.Footer>
                </Modal>
            )}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});
CofigMenuWrapper.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(CofigMenuWrapper);
