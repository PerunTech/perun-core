import React from 'react';
import { Route } from 'react-router-dom';
import { store } from '../model';
import * as localRoutes from '.';
import { pluginManager } from './PluginManager';

/**
 * Sorts bundles by their dependencies to ensure correct loading order.
 * @param {Array} bundles - The list of plugin bundles to sort.
 * @returns {Array} - The sorted list of bundles.
 */
function sortBundlesByDependencies(bundles) {
    const bundleMap = new Map();
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    bundles.forEach(bundle => {
        bundleMap.set(bundle.id, bundle);
    });

    /**
     * Recursively visits each bundle and its dependencies.
     * @param {Object} bundle - The bundle to visit.
     */
    const visit = (bundle) => {
        if (!bundle || visited.has(bundle.id)) return;
        if (visiting.has(bundle.id)) throw new Error(`Circular dependency detected: ${bundle.id}`);

        visiting.add(bundle.id);

        const dependencies = JSON.parse(bundle.deps || '[]');
        dependencies.forEach(dep => visit(bundleMap.get(dep)));

        visiting.delete(bundle.id);
        visited.add(bundle.id);
        sorted.push(bundle);
    };

    bundles.forEach(bundle => visit(bundle));

    return sorted;
}

/**
 * Initializes and loads plugins based on the stored bundles in localStorage.
 * Ensures plugins are loaded in the correct order according to their dependencies.
 * Uses pluginManager.loadPlugin as the unified script loader.
 * @returns {Promise} - A promise that resolves when all plugins have been loaded.
 */
export function initializePlugins() {
    const storageBundles = JSON.parse(localStorage.getItem('bundleStorage')) || [];
    if (storageBundles.length === 0) return Promise.resolve();

    store.dispatch({ type: 'fetchingRoutes', payload: true });

    const sortedBundles = sortBundlesByDependencies(storageBundles);

    const loadPromises = sortedBundles.map(bundle => {
        if (bundle.id !== 'perun-core' && bundle.id !== 'naits') {
            return pluginManager.loadPlugin(bundle.id, '/' + bundle.id + '/' + bundle.js).catch(error => {
                console.error(`Error loading plugin ${bundle.id}:`, error);
                return null;
            });
        }
        return Promise.resolve();
    });

    return Promise.allSettled(loadPromises).then(() => {
        store.dispatch({ type: 'fetchingRoutes', payload: false });
    }).catch((error) => {
        console.error('Error loading plugins:', error);
        store.dispatch({ type: 'fetchingRoutes', payload: false });
    });
}

/**
 * The Application routes registry.
 */
const _registry = {};

export const router = (function() {
    /**
     * Creates a Route component based on the provided configuration.
     * @param {string} name - The name of the route.
     * @param {Object} config - The route configuration object.
     * @returns {JSX.Element} - The Route component.
     */
    const createRoute = (name, config) => {
        const { path, render, isExact } = config;

        if (path === undefined || render === undefined || isExact === undefined) {
            throw new Error(`Route with name: ${name} has invalid configuration.
                Failed to create a valid Route component. Please make sure that the configuration object specifies
                the following attributes: path, render, isExact.`);
        }
        const Component = render;
        return <Route exact={isExact} path={path} key={name} render={props => <Component {...props} />} />;
    };

    /**
     * Registers a route and updates the route registry.
     * @param {string} name - The name of the route.
     * @param {Object} routeConfig - The route configuration object.
     */
    const registerRoute = (name, routeConfig) => {
        setRoute(name, createRoute(name, routeConfig));
    };

    /**
     * Sets a route in the registry and dispatches an action to refresh routes.
     * @param {string} name - The name of the route.
     * @param {JSX.Element} route - The Route component.
     */
    const setRoute = (name, route) => {
        _registry[name] = route;
        store.dispatch({ type: 'refreshRoutes', value: _registry });
    };

    Object.entries(localRoutes).forEach(([name, config]) => {
        registerRoute(name, config);
    });

    return {
        registerRoute,
        setRoute,
    };
})();
