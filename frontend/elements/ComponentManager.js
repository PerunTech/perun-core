import React from 'react';
import { dataToRedux, publishState, store, removeAsyncReducer } from '../model';

export class ComponentManager extends React.Component {
  static getStateForComponent (componentId, key) {
    const currState = store.getState()
    let retval = null
    if (key !== null && key !== undefined) {
      if (currState[componentId][key] !== undefined) {
        retval = currState[componentId][key]
      }
    } else if (currState[componentId] !== undefined) {
      retval = currState[componentId]
    }
    return retval
  }
  static registerComponent (id, type, isPersistent, storeKeys) {
    dataToRedux(null, 'componentIndex', id, { type, isPersistent, listener: storeKeys })
  }

  static isComponentRegistered (id) {
    const currState = store.getState()
    const components = currState.componentIndex
    if (components[id] !== undefined) {
      return true
    } return false
  }

  static setStateForComponent (componentId, key, state) {
    const components = store.getState().componentIndex
    if (components[componentId]) {
      const componentData = components[componentId]

      if (key) {
        this.publishMeSingleValue(componentId, key, state, componentData.type)
      } else {
        this.publishMeFull(componentId, state, componentData.type)
      }
    }
  }
  static publishMeFull (finalId, props, typeOfComponent) {
    if (typeOfComponent === 'GenericGrid' || typeOfComponent === 'GenericForm') {
      store.dispatch(publishState(finalId, props))
    } else if (typeOfComponent === 'genericComponent') {
      dataToRedux(null, finalId, 'FULL_STATE', props)
    }
  }
  static publishMeSingleValue (finalId, key, value, typeOfComponent) {
    if (typeOfComponent === 'GenericGrid' || typeOfComponent === 'GenericForm') {
      store.dispatch(publishState(finalId, { [key]: value }))
    } else if (typeOfComponent === 'genericComponent') {
      dataToRedux(null, finalId, key, value)
    }
  }

  static cleanComponentReducerState (finalId) {
    removeAsyncReducer(store, finalId)
  }
}
