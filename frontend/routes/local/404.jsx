import React from 'react';
import NotFound from '../../components/NotFound/NotFound'

const Component = _props => {
    return <NotFound />
};

export const NotFoundRoute = {
    path: '/404',
    render: Component,
    isExact: true
};