import React from 'react';
import DocumentManager from '../../components/DocumentManager/DocumentManagerHolder'

const Component = props => {
    return <DocumentManager {...props} />
};

export const DocumentManagerRoute = {
    path: '/main/document_manager',
    render: Component,
    isExact: true
};