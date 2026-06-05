import React from "react";
import { ExportableGrid } from "../../../client";
import Icon from '../../../elements/util/Icon';
import { TABLE_NAME } from './utils';

const Breadcrumb = ({ breadcrumb, fmt, onNavigate }) => (
    <div className='admin-console-code-list-breadcrumb'>
        <span className='admin-console-code-list-crumb-link' onClick={() => onNavigate(-1)}>
            {fmt('perun.admin_console.search_results')}
        </span>
        {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={crumb.objectId}>
                <span className='admin-console-code-list-crumb-sep'> › </span>
                {idx < breadcrumb.length - 1 ? (
                    <span
                        className='admin-console-code-list-crumb-link'
                        onClick={() => onNavigate(idx)}
                    >
                        {crumb.codeValue} ({crumb.labelCode})
                    </span>
                ) : (
                    <span className='admin-console-code-list-crumb-current'>
                        {crumb.codeValue} ({crumb.labelCode})
                    </span>
                )}
            </React.Fragment>
        ))}
    </div>
);

const CodeListChildrenView = ({
    breadcrumb, childrenGridId, svSession, fmt,
    onNavigate, onEditCurrent, onAddChild, onExport, onRowClick,
}) => {
    const currentEntry = breadcrumb[breadcrumb.length - 1];
    return (
        <div className='admin-console-label-editor-div'>
            <Breadcrumb breadcrumb={breadcrumb} fmt={fmt} onNavigate={onNavigate} />
            <div className='admin-console-label-search-btn-container'>
                <button className='btn-outline btn_save_form' type="button" onClick={onEditCurrent}>
                    <Icon name='IconEdit' size={20} /> {fmt('perun.admin_console.edit_code_list')}
                </button>
                <button className='btn-outline btn_save_form' type="button" onClick={onAddChild}>
                    <Icon name='IconPlus' size={20} /> {fmt('perun.admin_console.add_child_code')}
                </button>
                <button className='btn-outline btn_save_form' type="button" onClick={onExport}>
                    <Icon name='IconFileExport' size={20} /> {fmt('perun.admin_console.export')}
                </button>
            </div>
            <ExportableGrid
                gridType="READ_URL"
                key={childrenGridId}
                id={childrenGridId}
                configTableName={`/ReactElements/getTableFieldList/${svSession}/${TABLE_NAME}`}
                dataTableName={`/ReactElements/getObjectsByParentId/${svSession}/${currentEntry.objectId}/${TABLE_NAME}/0/SORT_ORDER`}
                defaultHeight={false}
                heightRatio={0.7}
                refreshData={true}
                onRowClickFunct={onRowClick}
            />
        </div>
    );
};

export default CodeListChildrenView;
