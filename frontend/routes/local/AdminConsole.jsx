import React from 'react';
import AppSettings from '../../components/AdminConsole/AppSettings'

const Component = props => {
    return <AppSettings {...props} />
};

export const AdminConsole = {
    path: '/main/perun-core',
    render: Component,
    isExact: true
};