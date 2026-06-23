import React from "react";
import { ExportableGrid } from "../../../client";
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import Icon from '../../../elements/util/Icon';
import { TABLE_NAME, GRID_ID } from './utils';

const CodeListSearchForm = ({
    schema, uiSchema, searchFormData, searchParams, svSession, fmt,
    onSearch, onFormChange, onOpenAdd, onRowClick,
}) => (
    <div className='admin-console-label-editor-div'>
        <Form
            schema={schema}
            uiSchema={uiSchema}
            formData={searchFormData}
            onChange={onFormChange}
            key='SVAROG_CODES_SEARCH'
            className='form-test label-form-search'
            validator={validator}
            onSubmit={onSearch}
        >
            <></>
            <div className='admin-console-label-search-btn-container'>
                <button className='btn-outline btn_save_form' type="button" onClick={onOpenAdd}>
                    <Icon name='IconPlus' size={20} /> {fmt('perun.admin_console.create_code_list')}
                </button>
                <button className='btn-success btn_save_form' type="submit">
                    <Icon name='IconSearch' size={20} /> {fmt('perun.admin_console.search_button')}
                </button>
            </div>
        </Form>
        {searchParams && (
            <ExportableGrid
                gridType="READ_URL"
                id={GRID_ID}
                configTableName={`/ReactElements/getTableFieldList/${svSession}/${TABLE_NAME}`}
                dataTableName={`/ReactElements/getTableWithLike/${svSession}/${TABLE_NAME}/CODE_VALUE/${encodeURIComponent(searchParams.CODE_VALUE)}/0`}
                defaultHeight={false}
                heightRatio={0.6}
                refreshData={true}
                onRowClickFunct={onRowClick}
            />
        )}
    </div>
);

export default CodeListSearchForm;
