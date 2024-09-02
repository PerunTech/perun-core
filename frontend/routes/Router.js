import React from 'react';
import { Route } from 'react-router-dom';
import { store } from '../model';
import * as localRoutes from '.';
/**
 * The local index of core routes.
 * 
 * This type of import (import all) preserves order, thus routes order is specified in the index
 * and App integrity is preserved. 
 */
let storageBundles

function loadPlugin(name, url) {
    return new Promise((resolve, reject) => {
        // Create a script element.
        const script = Object.assign(document.createElement('script'), { id: name, type: 'text/javascript' });

        script.onload = () => // revise compatibility(IE) and window[name] gimmick.
            resolve({ id: name, value: reRegisterRouter(name, (window[name][name] || window[name])) });
        script.onerror = () => // Do better messages.
            reject({ id: name, value: Reflect.construct(Error, ['Script failed to load for plugin ' + name]) });

        script.src = url; // images load on this line. Browser implementaion specific.
        document.body.appendChild(script); // JS scripts load on this line.
    });
}

function reInitPlugins(storageBundles) {
    store.dispatch({ type: 'fetchingRoutes', payload: true })
    storageBundles.map(bundle => {
        if (bundle.id !== 'edbar')
            loadPlugin(bundle.id, '/' + bundle.id + '/' + bundle.js);
    })
    setTimeout(() => {
        store.dispatch({ type: 'fetchingRoutes', payload: false })
    }, 10000)
}

function reRegisterRouter(name, plugin) {
    plugin.routes && [...plugin.routes].map(route => router.registerRoute(route.name, route));
    plugin.id = name;
    storageBundles[name] = plugin;
    return plugin;
}

/**
 *  The Application routes registry.
 */
const _registry = {};

export const router = (function () {
    storageBundles = JSON.parse(localStorage.getItem('bundleStorage'));
    const navigationType = window.performance.getEntriesByType('navigation')[0]
    if (navigationType.type === 'reload' && storageBundles) {
        reInitPlugins(storageBundles)
    }

    // Route templater.
    const createRoute = (name, config) => {
        const { path, render, isExact } = config;

        if (path === undefined || render === undefined || isExact === undefined) {
            throw new Error(`Route with name: ${name} has invalid configuration.
                Failed to create a valid Route component. Please make sure that the configuration object specifies
                the following attributes: path, render, isExact.`)
        }
        const Component = render; // Because React is silly like that. We need capital letters.
        return <Route exact={isExact} path={path} key={name} render={props => <Component {...props} />} />;
    };

    const registerRoute = (name, routeConfig) => setRoute(name, createRoute(name, routeConfig));
    const unregisterRoute = () => { };
    const setRoute = (name, route) => {
        _registry[name] = route,
            store.dispatch({ type: 'refreshRoutes', value: _registry })
    };
    const getRoute = () => { };
    const getRegistry = () => _registry;

    // Auto generate Routes for all locally indexed configuration objects.
    Object.entries(localRoutes).map(([name, config]) => registerRoute(name, config));

    return {
        registerRoute,
        unregisterRoute,
        setRoute,
        getRoute,
        getRegistry
    }
})();