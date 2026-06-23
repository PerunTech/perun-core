import React from "react";
import { ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import Icon from '../../../elements/util/Icon';
import { downloadJsonFile } from './utils';

const CodeListExportModal = ({
    show, exportData, exportLoading, fmt, onHide,
}) => (
    <Modal className='admin-console-unit-modal' show={show} onHide={onHide}>
        <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>{fmt('perun.admin_console.export_code_list')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='admin-console-unit-modal-body'>
            <div className='label-export-panel'>
                {exportLoading && (
                    <div className='label-export-loader'>
                        <div className='label-export-spinner' />
                        <p className='label-export-loader-title'>{fmt('perun.admin_console.export_loading_title')}</p>
                        <p className='label-export-loader-hint'>
                            {fmt('perun.admin_console.export_loading_hint_1')}<br />
                            {fmt('perun.admin_console.export_loading_hint_2')}
                        </p>
                    </div>
                )}
                {exportData && (
                    <div className='label-export-preview-container'>
                        <div className='admin-console-label-search-btn-container'>
                            <button
                                className='btn-outline btn_save_form'
                                onClick={() => downloadJsonFile(exportData, 'codes.properties')}
                            >
                                <Icon name='IconDownload' size={20} /> {fmt('perun.admin_console.download')}
                            </button>
                        </div>
                        <div className='label-export-preview'>
                            <pre>{JSON.stringify(exportData, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </Modal.Body>
        <Modal.Footer className='admin-console-unit-modal-footer' />
    </Modal>
);

export default CodeListExportModal;
