import React, { lazy } from 'react';
import { Configurator } from '../../loadConfiguration';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import { svSessionRegxp } from '../../model';
import { Loading } from '../../components/ComponentsIndex';

const UserIsNotAuthenticatedSoNeverEnter = connectedRouterRedirect({
    redirectPath: '/',
    allowRedirectBack: false,
    authenticatedSelector: state => svSessionRegxp(state.security.svSession),
    authenticatingSelector: state => state.security.isBusy,
    // Want to redirect the user when they are done loading and authenticated
    wrapperDisplayName: 'UserIsNotAuthenticatedSoNeverEnter',
    AuthenticatingComponent: Loading
});
const ModuleMenu = UserIsNotAuthenticatedSoNeverEnter(lazy(() => import('../../components/Menus/ModuleMenu')))
const Component = props => {
    return <Configurator key='ModuleMenuConfigurator' type='MODULE_MENU'>
        <ModuleMenu {...props} />
    </Configurator>
};

export const Main = {
    path: '/main',
    render: Component,
    isExact: true
};