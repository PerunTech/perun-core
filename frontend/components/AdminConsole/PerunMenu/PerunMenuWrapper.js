import React from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import JsonView from 'react-json-view';
import axios from 'axios';
import { ReactBootstrap, alertUserV2, ComponentManager, alertUserResponse } from '../../../elements';
import { isJSON } from '../../../functions/utils';
import SideMenu from './SideMenu';
import { iconManager } from '../../../assets/svg/svgHolder';
import Swal from 'sweetalert2';
const { useState, useEffect } = React;
const { Modal } = ReactBootstrap;

const PerunMenuWrapper = (props, context) => {
  const [objectId, setObjectId] = useState(undefined)
  const [show, setShow] = useState(false);
  const [shouldRender, setRender] = useState(false)
  const [fieldJson, setFieldJson] = useState({})
  const [editedJson, setJson] = useState(undefined)
  const [configuration, setConfig] = useState(undefined)

  useEffect(() => {
    changeField()
  }, [])

  useEffect(() => {
    if (shouldRender) {
      handleInput()
      getObjectId()
    }
  }, [shouldRender])

  const getObjectId = () => {
    const { formid } = props
    const formData = ComponentManager.getStateForComponent(formid, 'formTableData');
    const formDataLoaded = ComponentManager.getStateForComponent(formid, 'formDataLoaded')
    if (formData && formDataLoaded) {
      setObjectId(formData.OBJECT_ID)
    }
  }

  const handleInput = () => {
    const firstInput = document.getElementById('root_MENU_CONF');
    if (firstInput) {
      firstInput.addEventListener('click', openJsonEditor);
      firstInput.style.cursor = 'pointer'
    }
  }

  const changeField = () => {
    const { formid } = props
    const jsonSchema = ComponentManager.getStateForComponent(formid, 'formData');
    const uiSchema = ComponentManager.getStateForComponent(formid, 'uischema');
    if (jsonSchema) {
      if (uiSchema) {
        uiSchema['MENU_CONF'] = { 'ui:readonly': true }
        delete jsonSchema.properties['MENU_CONF'].format
        ComponentManager.setStateForComponent(formid, 'formData', jsonSchema);
        props.formInstance.setState({ formData: jsonSchema });
        ComponentManager.setStateForComponent(formid, 'uischema', uiSchema);
        props.formInstance.setState({ uischema: uiSchema });
        setRender(true)
      }
    }
  }

  const openJsonEditor = () => {
    const { formid } = props
    const formData = ComponentManager.getStateForComponent(formid, 'formTableData');
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
    const formData = ComponentManager.getStateForComponent(formid, 'formTableData');
    const onConfirm = () => {
      formData['MENU_CONF'] = JSON.stringify(editedJson)
      ComponentManager.setStateForComponent(formid, 'formTableData', formData);
      props.formInstance.setState({ formTableData: formData });
    }
    alertUserV2({
      type: 'info',
      title: context.intl.formatMessage({ id: 'perun.admin_console.change_json', defaultMessage: 'perun.admin_console.change_json' }),
      onConfirm
    })
  }

  const generateMenuPreview = () => {
    const { formid } = props
    const formData = ComponentManager.getStateForComponent(formid, 'formTableData');
    const url = `${window.server}/Menu/generate/${props.svSession}/${formData['MENU_CODE']}`
    axios.get(url).then(res => {
      setConfig(res.data['buttonArray'])
      setShow(true)
    }).catch(err => {
      console.error(err)
      alertUserResponse({ response: err })
    })
  }

  const downloadMenu = () => {
    const { formid, svSession } = props
    const formData = ComponentManager.getStateForComponent(formid, 'formTableData');
    const menuCode = formData['MENU_CODE']
    const download = (resolveImports) => {
      const url = `${window.server}/Menu/download/${svSession}/${menuCode}/${resolveImports}`
      window.open(url, '_blank')
    }
    alertUserV2({
      type: 'info',
      title: `${context.intl.formatMessage({ id: 'perun.admin_console.download_menu', defaultMessage: 'perun.admin_console.download_menu' })}: ${menuCode}`,
      message: context.intl.formatMessage({ id: 'perun.admin_console.resolve_imports_prompt', defaultMessage: 'perun.admin_console.resolve_imports_prompt' }),
      showCancel: true,
      showDeny: true,
      confirmButtonText: context.intl.formatMessage({ id: 'perun.admin_console.yes', defaultMessage: 'perun.admin_console.yes' }),
      cancelButtonText: context.intl.formatMessage({ id: 'perun.admin_console.cancel', defaultMessage: 'perun.admin_console.cancel' }),
      denyButtonText: context.intl.formatMessage({ id: 'perun.admin_console.no', defaultMessage: 'perun.admin_console.no' }),
      denyButtonColor: '#7cd1f9',
      onConfirm: () => download(true),
      onCancel: () => Swal.close(),
      onDeny: () => download(false),
    })
  }

  return (
    <>
      {shouldRender &&
        <>
          {objectId && (
            <div className='perun-menu-buttons-container'>
              <button className='btn-success btn_save_form download-menu-btn' onClick={downloadMenu}>
                {context.intl.formatMessage({ id: 'perun.admin_console.download_menu', defaultMessage: 'perun.admin_console.download_menu' })}
                <span className='download-span'>{iconManager.getIcon('download')}</span>
              </button>
              <button className='btn-success btn_save_form preview-btn' onClick={() => { generateMenuPreview() }}>
                {context.intl.formatMessage({ id: 'perun.admin_console.preview_title', defaultMessage: 'perun.admin_console.preview_title' })}
                <span className='preview-span'>{iconManager.getIcon('eyeShow')}</span>
              </button>
            </div>
          )}
          {props.children}
        </>
      }
      {show && (
        <Modal
          className='admin-console-unit-modal menu-editor-modal'
          show={show}
          onHide={() => { setShow(false), setConfig(undefined) }}>
          <Modal.Header className='admin-console-unit-modal-header  menu-editor-header' closeButton>
            <Modal.Title>{configuration && context.intl.formatMessage({ id: 'perun.admin_console.preview_title', defaultMessage: 'perun.admin_console.preview_title' })}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body  menu-editor-body'>
            {!configuration && <div>
              <JsonView src={fieldJson} onEdit={jsonManipulation} onAdd={jsonManipulation} onDelete={jsonManipulation} collapsed />
              <div>
                <button type='button' className='btn-success btn_save_form' onClick={() => { editedJson && changeJson(editedJson) }}>{context.intl.formatMessage({ id: 'perun.admin_console.config_menu_confirm', defaultMessage: 'perun.admin_console.config_menu_confirm' })}</button>
              </div>
            </div>}
            {configuration && <SideMenu configuration={configuration} />}
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

PerunMenuWrapper.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(PerunMenuWrapper);
