import React from "react";
import { ReactBootstrap } from "../../../elements";
const { Modal } = ReactBootstrap;
import PropertiesPreview from './PropertiesPreview';
import { downloadPropertiesFile } from './utils';

const LabelExportModal = ({
    show, locales, selectedLocale, exportPreview, exportLoading, fmt,
    onHide, onSelectLocale,
}) => (
    <Modal className='admin-console-unit-modal' show={show} onHide={onHide}>
        <Modal.Header className='admin-console-unit-modal-header' closeButton>
            <Modal.Title>{fmt('perun.admin_console.export_labels')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='admin-console-unit-modal-body'>
            <div className='label-export-panel'>
                <div className='label-export-locales'>
                    {locales.map(({ id, label }) => (
                        <React.Fragment key={id}>
                            <input
                                type="radio"
                                name="locale-radio"
                                id={`locale-check-${id}`}
                                className='label-export-locale-input'
                                checked={selectedLocale === id}
                                onChange={() => onSelectLocale(id)}
                                disabled={exportLoading}
                            />
                            <label htmlFor={`locale-check-${id}`} className='label-export-locale-check'>
                                <span>{label}</span>
                            </label>
                        </React.Fragment>
                    ))}
                </div>
                <small className='text-muted'>
                    {fmt('perun.admin_console.export_locale_hint')}
                </small>
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
                {exportPreview && (
                    <div className='admin-console-label-search-btn-container'>
                        <button
                            className='btn-outline btn_save_form'
                            onClick={() => downloadPropertiesFile(exportPreview, selectedLocale)}
                        >
                            {fmt('perun.admin_console.download')}
                        </button>
                    </div>
                )}
                {exportPreview && <PropertiesPreview text={exportPreview} />}
            </div>
        </Modal.Body>
        <Modal.Footer className='admin-console-unit-modal-footer' />
    </Modal>
);

export default LabelExportModal;
