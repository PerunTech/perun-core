import React from 'react';
import MyProfile from '../../components/User Management/MyProfile/MyProfile';
const Component = props => {
    return <MyProfile {...props} />
};

export const MyProfileRoute = {
    path: '/main/my-profile',
    render: Component,
    isExact: true
};