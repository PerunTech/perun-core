import React from 'react';
import AdminConsole from '../../components/AdminConsole/AdminConsole'

const Component = props => {
    return <AdminConsole {...props} />
};

export const AdminConsoleRoute = {
    path: '/main/perun-core',
    render: Component,
    isExact: true
};