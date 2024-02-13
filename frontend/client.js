/* Base libraries */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux'; // these should be represented in /model and imported from there.
import { persistStore } from 'redux-persist';
import axios from 'axios'
import PerunCoreErrorHanlder from './functions/PerunCoreErrorHanlder'
/* assets */
import * as assets from './assets/index'; // eslint-disable-line
import { Link } from 'react-router-dom'; // these should be represented in /routes and imported from there.
import { generatePath } from 'react-router'
import createHashHistory from 'history/createHashHistory';

/* i18n */
import { addLocaleData } from 'react-intl';
import { IntlProvider, updateIntl } from 'react-intl-redux';


/* Google Analytics */
import ReactGA from 'react-ga';

/* Local modules */
import * as redux from './model';
import * as elements from './elements';
import { Configurator } from './loadConfiguration';
import { router } from './routes/Router';
import Routes from './routes/Routes';
import { Loading } from 'components/ComponentsIndex';
import { pluginManager } from './routes/PluginManager';

/* Utility functions */
import * as utils from './functions/utils'
import * as cookies from './functions/cookies'

/* -------- */
/* Assembly */
/* -------- */
export {
  React, ReactDOM, PropTypes, Provider, connect, Link, generatePath, router, pluginManager, redux, elements, utils, Configurator,
  axios, Loading, createHashHistory, PerunCoreErrorHanlder
};

/* elements-base */
import { Button, DependencyDropdown, Dropdown, InputElement, alertUser } from './elements'

/* elements-form & grid*/
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import DownloadableForm from './elements/form/DownloadableForm'
import FormManager from './elements/form/FormManager'
import GenericForm from './elements/form/GenericForm'
import StructuredForm from './elements/form/StructuredForm'
import ContextMenuPopup from './elements/grid/ContextMenuPopup'
import CustomGridToolbar from './elements/grid/CustomGridToolbar'
import ExportableGrid from './elements/grid/ExportableGrid'
import GenericGrid from './elements/grid/GenericGrid'
import GridManager from './elements/grid/GridManager'
import JsonToExcel from './elements/grid/JsonToExcel'
import { ComponentManager } from './elements/ComponentManager'
import Modal from './components/Modal/Modal.js'
import MenuHolder from './components/MenuBuilder/MenuHolder'
import ContextMenuHolder from './components/Menus/ContextMenu/ContextMenuHolder'
import RuleEngineModal from './components/RuleEngineModal/RuleEngineModal'
import { attachmentButtons } from './elements/upload_download/AttachmentData'
import AttachmentInput from './elements/upload_download/AttachmentInput';

export {
  Form, Button, DependencyDropdown, Dropdown, InputElement, DownloadableForm, FormManager, GenericForm, StructuredForm, ContextMenuPopup, CustomGridToolbar,
  ExportableGrid, GenericGrid, GridManager, JsonToExcel, ComponentManager, Modal, MenuHolder, ContextMenuHolder, RuleEngineModal, attachmentButtons, AttachmentInput,
  validator
};


/* exception for arraybuffer response types f.r */
function validResponse(res) {
  if (!res) {
    return false
  }
  if (res.responseType === 'arraybuffer') {
    return false
  } else {
    return true
  }
}

axios.interceptors.response.use(
  (res) => {
    if (res?.status === 200) {
      if (res.data.type === 'ERROR' && (res.data.title === 'Невалидна сесија' || res.data.title === 'error.invalid_session')) {
        alertUser(true, 'error', 'Invalid session', 'Please log in again', () => {
          createHashHistory().push('/home/login')
          // location.reload();
          return res;
        })
      }
      if (res.data && res.data.type === 'EXCEPTION') {
        alertUser(true, 'error', res.data.title || '', res.data.message || '', () => {
          createHashHistory().push('/home/login')
          // location.reload();
          return res;
        })
      }
    }
    return res;
  },
  (error) => {
    const url = error.response.config.url || ''
    const title = error.response?.data?.title || error
    const msg = error.response?.data?.message || ''
    if (error.response.status) {
      switch (error.response.status) {
        case 302:
          alertUser(true, 'error', 'The server responsed with a status code 302 Found', url)
          break;
        case 401:
          createHashHistory().push('/home/login')
          alertUser(true, 'error', title, msg);
          redux.store.dispatch({ type: 'LOGOUT_FULFILLED', payload: undefined })
          break;
        case 502:
          alertUser(true, 'error', 'The server responsed with a status code 502 Bad Gateway', url)
          break;
        default:
          return Promise.reject(error);
      }
    } else {
      let msg = error.message
      switch (true) {
        case msg.includes('401'):
          /* if the accesed route is fr map memorize it and write it in window core */
          if (error.config.url.includes('/lpis/get/farmerAssets/undefined/')) {
            if (window.location.href.includes('farm-registry/map')) {
              window.core.memorizeFrMapRoute = window.location.href
            }
          }

          createHashHistory().push('/home/login')
          // location.reload();
          break;
        case msg.includes('500'):
          return Promise.reject(error);
        case msg.includes('502'):
          console.log(msg)
          return Promise.reject(error);
        default:
          return Promise.reject(error);
      }
    }
  }, { runWhen: validResponse }
);


const App = () =>
  <Provider store={redux.store}>
    <IntlProvider>
      <Routes />
    </IntlProvider>
  </Provider>

/* if user acces fr route memorize it */
let memorizeFrMapRoute
if (window.location.href.includes('farm-registry/map')) {
  memorizeFrMapRoute = window.location.href
  createHashHistory().push('/home/login')
}

window.core = { React, ReactDOM, Provider, connect, Link, router, pluginManager, redux, elements, Configurator, memorizeFrMapRoute }

/* ---- */
/* Init */
/* ---- */
const app = document.getElementById('body');
let persistConfig = {}
let whitelist = []
let indexReducer = 0
let whitelistRoot = [
  'checkForInvalidSession',
  'configurator',
  'globalRequestProcessor',
  'gridConfig',
  'intl',
  'security',
  'stateTooltip',
  'userInfo',
  'clickedMenuReducer',
  'moduleLinks'
]

// Use the default locale defined in the assets project
// If the default locale doesn't exist, fallback to the english one
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

/* call function on perun-core initialization f.r */
persistBundleReducers(whitelistRoot)

changeLanguageAndLocale(defaultLocale?.replace('_', '-'), defaultLocale)

/* exportable function to add persist reducers from bundle f.r */
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

ReactGA.initialize('UA-138995187-1');
ReactGA.pageview('/');


export function changeLanguageAndLocale(locale, language) {
  ReactDOM.render(<Loading />, app);
  persistStore(redux.store, persistConfig, () => {
    redux.dataToRedux((response) => {
      document.cookie = `defaultLocale=${language};max-age=${(365 * 24 * 60 * 60)}`
      redux.store.dispatch(updateIntl({ locale: locale, messages: response }));
      app && ReactDOM.render(<App />, app);
    },
      'security',
      'temp',
      'MAIN_LABELS',
      language,
      'perun'
    );
  })
}
