/* Base libraries */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { persistStore } from 'redux-persist';
import axios from 'axios'
import md5 from 'md5'
import Swal from 'sweetalert2'

/* Assets */
import * as assets from './assets/index'; // eslint-disable-line

/* Routing & history */
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router'
import { createHashHistory } from 'history';

/* i18n */
import { addLocaleData } from 'react-intl';
import { IntlProvider, updateIntl } from 'react-intl-redux';

/* Google Analytics */
import ReactGA from 'react-ga';

/* Local modules */
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

/* Forms */
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import FormManager from './elements/form/FormManager'
import GenericForm from './elements/form/GenericForm'

/* Grid */
import ContextMenuPopup from './elements/grid/ContextMenuPopup'
import CustomGridToolbar from './elements/grid/CustomGridToolbar'
import ExportableGrid from './elements/grid/ExportableGrid'
import GenericGrid from './elements/grid/GenericGrid'
import GridManager from './elements/grid/GridManager'

/* UI */
import { Tooltip } from 'react-tooltip'

/* Utility functions */
import * as utils from './functions/utils'
import * as cookies from './functions/cookies'

/* -------- */
/* Exports  */
/* -------- */
export {
  React, ReactDOM, PropTypes, Provider, connect, Link, generatePath, router, pluginManager, redux, elements, utils, Configurator,
  axios, Loading, createHashHistory, md5, Swal,
  Form, Tooltip, Button, DependencyDropdown, Dropdown, InputElement, FormManager, GenericForm, ContextMenuPopup, CustomGridToolbar,
  ExportableGrid, GenericGrid, GridManager, ComponentManager, Modal, validator
};

/* -------------------- */
/* Axios interceptors   */
/* -------------------- */

/* check for arraybuffer response types */
function validResponse(res) {
  return !!res && res.responseType !== 'arraybuffer'
}

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
    } else {
      const msg = error?.message || ''
      if (msg.includes('401')) {
        /* if the accessed route is fr map memorize it and write it in window core */
        if (error.config.url.includes('/lpis/get/farmerAssets/undefined/')) {
          if (window.location.href.includes('farm-registry/map')) {
            window.core.memorizeFrMapRoute = window.location.href
          }
        }
        createHashHistory().push('/home/login')
      } else {
        return Promise.reject(error);
      }
    }
  }, { runWhen: validResponse }
);

/* -------------------- */
/* Init & configuration */
/* -------------------- */
const app = document.getElementById('app');
let persistConfig = {}
let whitelist = []
let indexReducer = 0
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

/* -------------------- */
/* Use the default locale defined in the assets project */
/* If the default locale doesn't exist, fallback to the english one */
/* -------------------- */
const defaultLocale = cookies.getCookie('defaultLocale') || 'en_US'
let localeData = ['en']
if (utils.isJSON(cookies.getCookie('localeData'))) {
  localeData = JSON.parse(cookies.getCookie('localeData'))
}
localeData.forEach((locale) => loadLocaleData(locale))

async function loadLocaleData(locale) {
  try {
    const localeData = await import(`react-intl/locale-data/${locale}`);
    addLocaleData(localeData.default);
  } catch (error) {
    console.error(`Error loading locale data for "${locale}":`, error);
  }
}

/* Google Analytics */
if (process.env.GA_TRACKING_ID) {
  ReactGA.initialize(process.env.GA_TRACKING_ID);
  ReactGA.pageview('/');
}

/* -------------------- */
/* App component        */
/* -------------------- */
const App = () => (
  <Provider store={redux.store}>
    <IntlProvider>
      <Routes />
    </IntlProvider>
  </Provider>
)

/* If user accesses fr route, memorize it */
let memorizeFrMapRoute
if (window.location.href.includes('farm-registry/map')) {
  memorizeFrMapRoute = window.location.href
  createHashHistory().push('/home/login')
}

window.core = { React, ReactDOM, Provider, connect, Link, router, pluginManager, redux, elements, Configurator, memorizeFrMapRoute }

/* -------------------- */
/* Bootstrap & render   */
/* -------------------- */
let appBootstrapPromise
function waitForAppBootstrap() {
  if (!appBootstrapPromise) {
    appBootstrapPromise = router.waitForPlugins().catch((error) => {
      console.error('Plugin bootstrap failed:', error)
    })
  }
  return appBootstrapPromise
}

function renderApp() {
  waitForAppBootstrap().then(() => {
    app && ReactDOM.render(<App />, app);
  })
}

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

/* exportable function to add persist reducers from bundle */
export function persistBundleReducers(listOfBundleReducers) {
  let res = whitelist.filter(item => listOfBundleReducers.includes(item));
  if (res.length > 0) {
    console.log('duplicate reducers')
  } else {
    whitelist.push(...listOfBundleReducers)

    /* if reducers come from perun-core, skip the incrementation */
    if (!listOfBundleReducers.includes('intl')) {
      indexReducer++
    }

    persistConfig = {
      whitelist: [...whitelist]
    }
  }

  if (window.location.hostname === 'localhost') {
    changeLanguageAndLocale(defaultLocale.replace('_', '-'), defaultLocale)
  } else {
    if (localStorage.getItem('indexReducers') === indexReducer.toString()) {
      changeLanguageAndLocale(defaultLocale.replace('_', '-'), defaultLocale)
    } else {
      console.log(`Still waiting on all ${localStorage.getItem('indexReducers')} reducers...`)
    }
  }
}

/* Initialize on perun-core load */
persistBundleReducers(whitelistRoot)
