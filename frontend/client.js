// Base libraries
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { persistStore } from 'redux-persist';
import axios from 'axios'
import md5 from 'md5'
// Assets
import * as assets from './assets/index'; // eslint-disable-line
// Routing & history
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router'
import { createHashHistory } from 'history';
// i18n
import { addLocaleData } from 'react-intl';
import { IntlProvider, updateIntl } from 'react-intl-redux';
// Google Analytics
import ReactGA from 'react-ga';
// Local modules
import * as redux from './model';
import * as elements from './elements';
import { Button, DependencyDropdown, Dropdown, InputElement, alertUserV2, alertUserResponse } from './elements'
import { Configurator } from './loadConfiguration';
import { router } from './routes/Router';
import Routes from './routes/Routes';
import { Loading } from 'components/ComponentsIndex';
import { pluginManager } from './routes/PluginManager';
import { ComponentManager } from './elements/ComponentManager'
import Modal from './components/Modal/Modal.js'
// Forms
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import FormManager from './elements/form/FormManager'
import GenericForm from './elements/form/GenericForm'
// Grids
import ContextMenuPopup from './elements/grid/ContextMenuPopup'
import CustomGridToolbar from './elements/grid/CustomGridToolbar'
import ExportableGrid from './elements/grid/ExportableGrid'
import GenericGrid from './elements/grid/GenericGrid'
import GridManager from './elements/grid/GridManager'
// UI
import { Tooltip } from 'react-tooltip'
import Swal from 'sweetalert2'
// Utility functions
import * as utils from './functions/utils'
import * as cookies from './functions/cookies'

// Exports
export {
  React, ReactDOM, PropTypes, Provider, connect, Link, generatePath, router, pluginManager, redux, elements, utils, Configurator,
  axios, Loading, createHashHistory, md5, Swal,
  Form, Tooltip, Button, DependencyDropdown, Dropdown, InputElement, FormManager, GenericForm, ContextMenuPopup, CustomGridToolbar,
  ExportableGrid, GenericGrid, GridManager, ComponentManager, Modal, validator
};

// Check for arraybuffer response types
function validResponse(res) {
  return !!res && res.responseType !== 'arraybuffer'
}

// Axios interceptors
axios.interceptors.request.use((config) => {
  const svSession = redux.store?.getState()?.security?.svSession
  if (svSession) {
    config.headers['sessionId'] = svSession
  }
  return config
})

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status) {
      switch (error.response.status) {
        case 302:
          alertUserV2({ type: 'info', title: 'The server responded with a status code 302 Found' })
          break;
        case 401:
          createHashHistory().push('/home/login')
          alertUserResponse({ response: error.response })
          redux.store.dispatch({ type: 'LOGOUT_FULFILLED', payload: undefined })
          break;
        case 502:
        case 503:
          alertUserV2({ type: 'info', title: 'The server is temporarily down for maintenance', message: 'Please try again soon' })
          break;
        default:
          return Promise.reject(error);
      }
    }
  }, { runWhen: validResponse }
);

// Init & configuration
const app = document.getElementById('app');
let persistConfig = {}
let whitelist = []
const whitelistRoot = [
  'checkForInvalidSession',
  'configurator',
  'globalRequestProcessor',
  'gridConfig',
  'intl',
  'security',
  'stateTooltip',
  'userInfo',
  'clickedMenuReducer',
  'moduleLinks',
  'businessLogicReducer'
]

// Use the default locale defined in the assets project.
// Falls back to English (en_US) if not set.
const defaultLocale = cookies.getCookie('defaultLocale') || 'en_US'
let localeData = ['en']
if (utils.isJSON(cookies.getCookie('localeData'))) {
  localeData = JSON.parse(cookies.getCookie('localeData'))
}
localeData.forEach((locale) => loadLocaleData(locale))

// Dynamically import and register locale data for react-intl
async function loadLocaleData(locale) {
  try {
    const localeData = await import(`react-intl/locale-data/${locale}`);
    addLocaleData(localeData.default);
  } catch (error) {
    console.error(`Error loading locale data for "${locale}":`, error);
  }
}

// Google Analytics
function initializeGoogleAnalytics() {
  const url = `${window.server}/WsConf/params/get/sys/GA_TRACKING_ID`
  axios.get(url).then(res => {
    const trackingId = res?.data?.VALUE
    if (trackingId) {
      ReactGA.initialize(trackingId);
      ReactGA.pageview('/');
    }
  }).catch(err => {
    console.error(err)
  })
}
initializeGoogleAnalytics()

// App component
const App = () => (
  <Provider store={redux.store}>
    <IntlProvider>
      <Routes />
    </IntlProvider>
  </Provider>
)

window.core = { React, ReactDOM, Provider, connect, Link, router, pluginManager, redux, elements, Configurator }

// Bootstrap & render
let appBootstrapPromise
// Wait for all plugins to load before rendering, caching the promise for repeated calls
function waitForAppBootstrap() {
  if (!appBootstrapPromise) {
    appBootstrapPromise = router.waitForPlugins().catch((error) => {
      console.error('Plugin bootstrap failed:', error)
    })
  }
  return appBootstrapPromise
}

// Render the root App component once plugin bootstrap completes
function renderApp() {
  waitForAppBootstrap().then(() => {
    app && ReactDOM.render(<App />, app);
  })
}

// Fetch additional i18n labels from the server and merge them with existing labels
function getAdditionalLabels(allLabels, locale, language, additionalLabels) {
  redux.dataToRedux((response) => {
    redux.store.dispatch(updateIntl({ locale: locale, messages: { ...allLabels, ...response } }));
    renderApp()
  },
    'security',
    'temp',
    'MAIN_LABELS',
    language,
    additionalLabels
  );
}

// Switch the app language by reloading labels from the server and re-rendering
export function changeLanguageAndLocale(locale, language) {
  ReactDOM.render(<Loading />, app);
  persistStore(redux.store, persistConfig, () => {
    redux.dataToRedux((response) => {
      document.cookie = `defaultLocale=${language};max-age=${(365 * 24 * 60 * 60)}`
      redux.store.dispatch(updateIntl({ locale: locale, messages: response }));
      const additionalLabels = cookies.getCookie('additionalLabels')
      if (additionalLabels) {
        getAdditionalLabels(response, locale, language, additionalLabels)
      } else {
        renderApp()
      }
    },
      'security',
      'temp',
      'MAIN_LABELS',
      language,
      'perun'
    );
  })
}

// Allows dependent modules to register additional reducers for Redux persistence
export function persistBundleReducers(listOfBundleReducers) {
  whitelist.push(...listOfBundleReducers)
  persistConfig = {
    whitelist: [...whitelist]
  }
  changeLanguageAndLocale(defaultLocale.replace('_', '-'), defaultLocale)
}

// Persist perun-core's own reducers on initial load
persistBundleReducers(whitelistRoot)
