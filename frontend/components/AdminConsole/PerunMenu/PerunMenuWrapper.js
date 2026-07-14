import React from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import { JsonEditor } from '../../JsonEditor';
import axios from 'axios';
import { ReactBootstrap, alertUserV2, ComponentManager, alertUserResponse, Icon } from '../../../elements';
import { Loading } from '../../ComponentsIndex';
import { isJSON } from '../../../functions/utils';
import SideMenu from './SideMenu';
const { useState, useEffect } = React;
const { Modal } = ReactBootstrap;

const PerunMenuWrapper = (props, context) => {
  const [loading, setLoading] = useState(false)
  const [objectId, setObjectId] = useState(undefined)
  const [show, setShow] = useState(false);
  const [shouldRender, setRender] = useState(false)
  const [fieldJson, setFieldJson] = useState({})
  const [configuration, setConfig] = useState(undefined)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)

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
    const objectId = ComponentManager.getStateForComponent(formid, 'objectId');
    if (objectId) {
      setObjectId(objectId)
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
    setLoading(true)
    axios.get(url).then(res => {
      setLoading(false)
      setConfig(res.data['buttonArray'])
      setShow(true)
    }).catch(err => {
      console.error(err)
      setLoading(false)
      alertUserResponse({ response: err })
    })
  }

  const downloadMenu = () => {
    setShowDownloadOptions(true)
  }

  const downloadResolvedMenu = (resolveImports) => {
    const { formid, svSession } = props
    const formData = ComponentManager.getStateForComponent(formid, 'formTableData');
    const menuCode = formData['MENU_CODE']
    const url = `${window.server}/Menu/download/${svSession}/${menuCode}/${resolveImports}`
    window.open(url, '_blank')
    setShowDownloadOptions(false)
  }

  const downloadObjectJson = () => {
    const { formid, svSession } = props
    const formData = ComponentManager.getStateForComponent(formid, 'formTableData');
    const menuCode = formData['MENU_CODE']
    const url = `${window.server}/WsCore/object/${svSession}/${objectId}/PERUN_MENU`
    setLoading(true)
    axios.get(url).then(res => {
      setLoading(false)
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${menuCode}.json`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      setShowDownloadOptions(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
      alertUserResponse({ response: err })
    })
  }

  return (
    <>
      {loading && <Loading />}
      {shouldRender &&
        <>
          {objectId && (
            <div className='perun-menu-buttons-container'>
              <button className='btn-success btn_save_form download-menu-btn' onClick={downloadMenu}>
                {context.intl.formatMessage({ id: 'perun.admin_console.download_menu', defaultMessage: 'perun.admin_console.download_menu' })}
                <span className='download-span'>{<Icon name="IconDownload" />}</span>
              </button>
              <button className='btn-success btn_save_form preview-btn' onClick={() => { generateMenuPreview() }}>
                {context.intl.formatMessage({ id: 'perun.admin_console.preview_title', defaultMessage: 'perun.admin_console.preview_title' })}
                <span className='preview-span'>{<Icon name="IconEye" />}</span>
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
            {!configuration && <JsonEditor value={fieldJson} onSave={changeJson} />}
            {configuration && <SideMenu configuration={configuration} />}
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer  menu-editor-footer'></Modal.Footer>
        </Modal>
      )}
      {showDownloadOptions && (
        <Modal
          className='admin-console-unit-modal menu-download-modal'
          show={showDownloadOptions}
          onHide={() => setShowDownloadOptions(false)}>
          <Modal.Header className='admin-console-unit-modal-header menu-download-header' closeButton>
            <Modal.Title>{context.intl.formatMessage({ id: 'perun.admin_console.download_menu', defaultMessage: 'perun.admin_console.download_menu' })}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body menu-download-body'>
            <p>{context.intl.formatMessage({ id: 'perun.admin_console.resolve_imports_prompt', defaultMessage: 'perun.admin_console.resolve_imports_prompt' })}</p>
            <div className='menu-download-buttons'>
              <button className='btn-success btn_save_form menu-download-resolved-btn' onClick={() => downloadResolvedMenu(true)}>
                {context.intl.formatMessage({ id: 'perun.admin_console.download_resolved', defaultMessage: 'perun.admin_console.download_resolved' })}
                <span className='download-span'>{<Icon name="IconDownload" />}</span>
              </button>
              <button className='btn-success btn_save_form menu-download-unresolved-btn' onClick={() => downloadResolvedMenu(false)}>
                {context.intl.formatMessage({ id: 'perun.admin_console.download_unresolved', defaultMessage: 'perun.admin_console.download_unresolved' })}
                <span className='download-span'>{<Icon name="IconDownload" />}</span>
              </button>
              <button className='btn-success btn_save_form menu-download-json-btn' onClick={downloadObjectJson}>
                {context.intl.formatMessage({ id: 'perun.admin_console.download_object_json', defaultMessage: 'perun.admin_console.download_object_json' })}
                <span className='download-span'>{<Icon name="IconDatabaseExport" />}</span>
              </button>
            </div>
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer menu-download-footer'></Modal.Footer>
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
