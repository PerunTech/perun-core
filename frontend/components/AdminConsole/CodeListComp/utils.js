import { axios } from '../../../client';

export const TABLE_NAME = 'SVAROG_CODES';
export const LABELS_TABLE_NAME = 'SVAROG_LABELS';
export const GRID_ID = 'SVAROG_CODES_SEARCH_GRID';
export const FORM_ID = 'SVAROG_CODES_FORM';
export const LABELS_FORM_ID = 'SVAROG_CODES_LABELS_FORM';
export const COMBINED_FORM_ID = 'SVAROG_CODES_COMBINED_FORM';

export const getRowField = (row, field) =>
    field === 'LABEL_CODE'
        ? row[`FIELD.${TABLE_NAME}.${field}`] || ''
        : row[`${TABLE_NAME}.${field}`] || '';

const buildNode = async (svSession, objectId, codeValue, labelCode, signal) => {
    const url = `${window.server}/ReactElements/getObjectsByParentId/${svSession}/${objectId}/${TABLE_NAME}/0`;
    const res = await axios.get(url, { signal });
    const rows = res?.data || [];
    const children = await Promise.all(
        rows.map(row => buildNode(
            svSession,
            getRowField(row, 'OBJECT_ID'),
            getRowField(row, 'CODE_VALUE'),
            getRowField(row, 'LABEL_CODE'),
            signal
        ))
    );
    const node = { user_code: codeValue, label_code: labelCode };
    if (children.length > 0) node.children = children;
    return node;
};

export const buildExportTree = (svSession, objectId, codeValue, labelCode, signal) =>
    buildNode(svSession, objectId, codeValue, labelCode, signal);

export const downloadJsonFile = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};
