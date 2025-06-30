import { combineReducers } from 'redux';
import createReducer from 'redux-updeep';
import { intlReducer } from 'react-intl-redux';
import gridConfig from './reducers/gridConfig';
import checkForInvalidSession from './reducers/checkForInvalidSession';
import configuratorReducer from './reducers/configuratorReducer';
import security from './reducers/logonReducer';
import globalRequestProcessor from './reducers/globalRequestProcessor';
import notificationReducer from './reducers/notificationReducer';
import contextMenuItemsReducer from './reducers/contextMenuItems'
import clickedMenuReducer from './reducers/clickedMenuReducer'
import { selectedGridRows } from './reducers/selectedGridRows';
import { historyReducer } from './reducers/historyReducer';
import { routesReducer } from './reducers/routesReducer';
import { modalReducer } from './reducers/modalReducer';
import businessLogicReducer from './reducers/businessLogicReducer'
import { userInfoReducer } from './reducers/userInfoReducer';
import moduleLinksReducer from './reducers/moduleLinksReducer';

export default function createReducers(asyncReducers) {
  const appReducer = combineReducers({
    gridConfig: gridConfig,
    security: security,
    intl: intlReducer,
    stateTooltip: createReducer('stateTooltip', { stateTooltip: false }),
    componentIndex: createReducer('componentIndex', {}),
    checkForInvalidSession: checkForInvalidSession,
    configurator: configuratorReducer,
    globalRequestProcessor: globalRequestProcessor,
    notificationReducer: notificationReducer,
    contextMenuItemsReducer: contextMenuItemsReducer,
    clickedMenuReducer: clickedMenuReducer,
    selectedGridRows: selectedGridRows,
    historyReducer: historyReducer,
    routes: routesReducer,
    modal: modalReducer,
    userInfo: userInfoReducer,
    businessLogicReducer: businessLogicReducer,
    moduleLinks: moduleLinksReducer,
    ...asyncReducers
  })

  const rootReducer = (state, action) => {
    const newStoreState = state
    return appReducer(newStoreState, action)
  }
  return rootReducer
}
