import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, GridManager, axios } from '../../client'
import { alertUser, ReactBootstrap } from '../../elements';
const { useState, useEffect } = React;
const { Modal } = ReactBootstrap;
const tableName = 'HOLDING_TYPE';
const gridId = `${tableName}_GRID`;

const BusinessType = (props, context) => {
  const [show, setShow] = useState(false);
  const [objectId, setObjectId] = useState(undefined)

  useEffect(() => {
    return () => {
      ComponentManager.cleanComponentReducerState(gridId);
    }
  }, []);

  const handleRowClick = (_id, _rowIdx, row) => {
    setObjectId(row[`${tableName}.OBJECT_ID`] || 0)
    setShow(true)
  };

  const generateBusinessTypeGrid = () => {
    const { svSession } = props;
    return (
      <ExportableGrid
        gridType='READ_URL'
        key={gridId}
        id={gridId}
        configTableName={`/ReactElements/getTableFieldList/${svSession}/${tableName}`}
        dataTableName={`/ReactElements/getTableData/${props.svSession}/${tableName}/0`}
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
    )
  };

  const saveRecord = (e) => {
    const { svSession } = props;
    const url = `${window.server}/ReactElements/createTableRecordFormData/${svSession}/${tableName}/0`;
    axios({
      method: 'post',
      data: encodeURIComponent(JSON.stringify(e.formData)),
      url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.data) {
        const resType = res.data.type.toLowerCase()
        const title = res.data.title || ''
        const msg = res.data.message || ''
        alertUser(true, resType, title, msg)
        GridManager.reloadGridData(gridId);
        setShow(false);
      }
    }).catch(err => {
      console.error(err)
      const title = err.response?.data?.title || err
      const msg = err.response?.data?.message || ''
      alertUser(true, 'error', title, msg, () => ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
        saveExecuted: false,
      }));
    });
  };

  const generateBusinessTypeForm = (objectId) => {
    const { svSession } = props;
    return (
      <GenericForm
        params={'READ_URL'}
        key={`${tableName}_FORM`}
        id={`${tableName}_FORM`}
        method={`/ReactElements/getTableJSONSchema/${svSession}/${tableName}`}
        uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${svSession}/${tableName}`}
        tableFormDataMethod={`/ReactElements/getTableFormData/${svSession}/${objectId}/${tableName}`}
        addSaveFunction={(e) => saveRecord(e)}
        hideBtns={objectId === 0 ? 'closeAndDelete' : 'close'}
        addDeleteFunction={deleteFunc}
        className={'admin-settings-forms'}
      />
    )
  };

  const deleteFunc = (_id, _action, _session, formData) => {
    const { svSession } = props;
    const url = `${window.server}/ReactElements/deleteObject/${svSession}`;
    axios({
      method: 'post',
      data: encodeURIComponent(formData[4]['PARAM_VALUE']),
      url: url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.data.type === 'SUCCESS') {
        alertUser(true, 'success', res.data.title, res.data.message);
        setShow(false);
        ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
          deleteExecuted: false,
        });
        ComponentManager.setStateForComponent(gridId, null, {
          rowClicked: undefined,
        });
        GridManager.reloadGridData(gridId);
      }
    }).catch(err => {
      console.error(err)
      const title = err.response?.data?.title || err
      const msg = err.response?.data?.message || ''
      alertUser(true, 'error', title, msg, () => ComponentManager.setStateForComponent(`${tableName}_FORM`, null, {
        deleteExecuted: false,
      }));
    });
  };

  return (
    <>
      <div className='admin-console-grid-container'>
        {generateBusinessTypeGrid()}
      </div>
      {show && (
        <Modal className='admin-console-unit-modal' show={show} onHide={() => setShow(false)}>
          <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>{context.intl.formatMessage({ id: 'perun.admin_console.add', defaultMessage: 'perun.admin_console.add' })}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-unit-modal-body'>
            {generateBusinessTypeForm(objectId)}
          </Modal.Body>
          <Modal.Footer className='admin-console-unit-modal-footer'></Modal.Footer>
        </Modal>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

BusinessType.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(BusinessType);
