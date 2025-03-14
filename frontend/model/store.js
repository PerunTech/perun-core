/* base imports */
import { applyMiddleware, createStore, compose } from 'redux';
/* middleware */
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';
import { createLogger as logger } from 'redux-logger';
import magicAsyncMiddleware from 'redux-magic-async-middleware';
/* plugins */
import { autoRehydrate } from 'redux-persist';
/* base implementation */
import createReducers from './createReducers';
import { svConfig } from '../config';

export function configureStore() {
  const composeEnhancers = (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
  let middleware = null
  if (svConfig.isDebug) {
    middleware = applyMiddleware(magicAsyncMiddleware, promise, thunk, logger())
  } else {
    middleware = applyMiddleware(magicAsyncMiddleware, promise, thunk)
  }
  const enhancer = composeEnhancers(autoRehydrate(), middleware)
  const store = createStore(createReducers(), enhancer)
  store.asyncReducers = {}
  return store;
}

export function injectAsyncReducer(store, name, asyncReducer) {
  store.asyncReducers[name] = asyncReducer
  store.replaceReducer(createReducers(store.asyncReducers))
}

export function removeAsyncReducer(store, name) {
  if (delete store.asyncReducers[name]) {
    const newStoreState = store.asyncReducers
    store.replaceReducer(createReducers(newStoreState))
  } else {
    console.warn('You are trying to remove a non-configurable own object property.')
  }
}

export const store = configureStore();