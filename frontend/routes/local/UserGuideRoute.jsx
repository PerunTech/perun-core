import React from 'react';
import UserGuide from '../../components/UserGuide/UserGuide'

const Component = props => {
    return <UserGuide {...props} />
};

export const UserGuideRoute = {
    path: '/main/user_guide',
    render: Component,
    isExact: true
};