import React from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import axios from 'axios';
import JsonView from 'react-json-view';
import { ReactBootstrap, alertUser, ComponentManager, GridManager } from '../../elements';
import { isJSON } from '../../functions/utils';
const { useState, useEffect } = React;
const { Modal } = ReactBootstrap;

const SvarogMenuWrapper = (props, context) => {
  const [show, setShow] = useState(false);
  const [shouldRender, setRender] = useState(false)
  const [fieldJson, setFieldJson] = useState({})
  const [editedJson, setJson] = useState(undefined)
  useEffect(() => {
    changeField()
  }, [])

  useEffect(() => {
    if (shouldRender) {
      handleInput()
    }
  }, [shouldRender])

  const handleInput = () => {
    const firstInput = document.getElementById("root_MENU_CONF");
    if (firstInput) {
      firstInput.addEventListener("click", openJsonEditor);
      firstInput.style.cursor = "pointer"
    }
  }

  const changeField = () => {
    const { formid } = props
    ComponentManager.setStateForComponent(formid, "addSaveFunction", addSaveFunction);
    props.formInstance.setState({ addSaveFunction: addSaveFunction })
    const jsonSchema = ComponentManager.getStateForComponent(
      formid,
      "formData"
    );
    const uiSchema = ComponentManager.getStateForComponent(
      formid,
      "uischema"
    );
    if (jsonSchema) {
      if (uiSchema) {
        uiSchema['MENU_CONF'] = { "ui:readonly": true }
        delete jsonSchema.properties['MENU_CONF'].format
        ComponentManager.setStateForComponent(formid, "formData", jsonSchema);
        props.formInstance.setState({ formData: jsonSchema });
        ComponentManager.setStateForComponent(formid, "uischema", uiSchema);
        props.formInstance.setState({ uischema: uiSchema });
        setRender(true)
      }
    }
  }

  const addSaveFunction = () => {
    const { svSession } = props;
    const { formid } = props
    const formData = ComponentManager.getStateForComponent(
      formid,
      "formTableData"
    );
    let url =
      window.server +
      `/ReactElements/createTableRecordFormData/${svSession}/SVAROG_MENU/0`;
    axios({
      method: "post",
      data: encodeURIComponent(JSON.stringify(formData)),
      url,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((res) => {
        if (res.data) {
          const resType = res.data.type.toLowerCase()
          const title = res.data.title || ''
          const msg = res.data.message || ''
          alertUser(true, resType, title, msg, () => {
            ComponentManager.setStateForComponent(`SVAROG_MENU_FORM`, null, {
              saveExecuted: false,
            });
            GridManager.reloadGridData('SVAROG_MENU_GRID');
          })
        }
      })
      .catch(err => {
        console.error(err)
        const title = err.response?.data?.title || err
        const msg = err.response?.data?.message || ''
        alertUser(true, "error", title, msg, () => ComponentManager.setStateForComponent(`SVAROG_MENU_FORM`, null, {
          saveExecuted: false,
        }));

      });
  };

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

  const changeJson = (editedJson) => {
    const { formid } = props
    const formData = ComponentManager.getStateForComponent(
      formid,
      "formTableData"
    );
    alertUser(true, "info", "perun.admin_console.change_json", "", () => {
      formData['MENU_CONF'] = JSON.stringify(editedJson)
      ComponentManager.setStateForComponent(formid, "formTableData", formData);
      props.formInstance.setState({ formTableData: formData });
    })
  }

  return (
    <>
      {shouldRender &&
        <>
          {props.children}
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
              <JsonView src={fieldJson} onEdit={jsonManipulation} onAdd={jsonManipulation} onDelete={jsonManipulation} collapsed />
              <div>
                <button type='button' className='btn-success btn_save_form' onClick={() => { editedJson && changeJson(editedJson) }}>{context.intl.formatMessage({ id: 'perun.admin_console.config_menu_confirm', defaultMessage: 'perun.admin_console.config_menu_confirm' })}</button>
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

SvarogMenuWrapper.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(SvarogMenuWrapper);
