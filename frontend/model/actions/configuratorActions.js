import axios from 'axios';
import a from '../actionNames.json';

export function addConfiguration(componentConfiguration, componentName) {
  return function (dispatch) {
    dispatch({ type: a.addComponentConfiguration, key: componentName, payload: componentConfiguration })
  }
}

export function globalRequest(restUrl, id) {
  return function (dispatch) {
    dispatch({ type: `${id}_PENDING`, payload: undefined })
    axios.get(restUrl).then((response) => {
      if (response.data.type === 'SUCCESS') {
        dispatch({ type: `${id}_FULFILLED`, payload: response.data.data })
      } else if (response.data.type === 'ERROR' || response.data.type === 'EXCEPTION') {
        dispatch({ type: `${id}_REJECTED`, payload: [response.data.title, response.data.message] })
      }
    }).catch((error) => {
      dispatch({ type: `${id}_REJECTED`, payload: error })
    })
  }
}

export function cleanGlobalRequestState(id) {
  return function (dispatch) {
    dispatch({ type: id, payload: undefined })
  }
}