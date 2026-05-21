import React from "react";
import { ExportableGrid } from "../../../client";
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { TABLE_NAME, GRID_ID } from './utils';

const LabelSearchForm = ({
    schema, uiSchema, searchFormData, searchParams, svSession, fmt,
    onSearch, onFormChange, onOpenAdd, onOpenExport, onRowClick,
}) => (
    <div className='admin-console-label-editor-div'>
        <Form
            schema={schema}
            uiSchema={uiSchema}
            formData={searchFormData}
            onChange={onFormChange}
            key='SVAROG_LABELS_SEARCH'
            className='form-test label-form-search'
            validator={validator}
            onSubmit={onSearch}
        >
            <></>
            <div className='admin-console-label-search-btn-container'>
                <button className='btn-outline btn_save_form' type="button" onClick={onOpenAdd}>
                    {fmt('perun.admin_console.create_label')}
                </button>
                <button className='btn-outline btn_save_form' type="button" onClick={onOpenExport}>
                    {fmt('perun.admin_console.export')}
                </button>
                <button className='btn-success btn_save_form' type="submit">
                    {fmt('perun.admin_console.search_button')}
                </button>
            </div>
        </Form>
        {searchParams && (
            <ExportableGrid
                gridType="READ_URL"
                id={GRID_ID}
                configTableName={`/ReactElements/getTableFieldList/${svSession}/${TABLE_NAME}`}
                dataTableName={`/ReactElements/getTableWithLike/${svSession}/${TABLE_NAME}/${searchParams.SEARCH_OPTION}/${encodeURIComponent(searchParams.SEARCH_VALUES)}/0`}
                defaultHeight={false}
                heightRatio={0.5}
                refreshData={true}
                onRowClickFunct={onRowClick}
                minHeight={500}
            />
        )}
    </div>
);

export default LabelSearchForm;
