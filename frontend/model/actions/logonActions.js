import axios from 'axios';
import * as a from '../actionNames.json';
import { svSessionRegxp } from '..';

export function loginUser(restUrl, method, formData, customData) {
  return function (dispatch) {
    dispatch({ type: a.loginPending, payload: undefined })
    // make the call
    if (customData) {
      dispatch({ type: a.loginIacs, payload: customData })
    } else {
      axios({
        method: method,
        url: restUrl,
        data: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then((response) => {
        if (svSessionRegxp(response.data.data.token)) {
          // success, session returned
          // dispatch({ type: a.loginFulfilled, payload: response.data })
          dispatch({ type: a.loginIacs, payload: response.data })
        } else {
          dispatch({ type: a.loginRejected, payload: response.data })
        }
      }).catch((error) => {
        // error
        dispatch({ type: a.loginRejected, payload: error })
      })
    }
  }
}

export function registerUser(restUrl, method, formData) {
  return function (dispatch) {
    dispatch({ type: a.registerPending, payload: undefined })
    // make the call
    axios({
      method: method,
      url: restUrl,
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      dispatch({ type: a.registerFulfilled, payload: response.data })
    }).catch((error) => {
      // error
      dispatch({ type: a.registerRejected, payload: error })
    })
  }
}

export function recoverPassword(restUrl, method, formData) {
  return function (dispatch) {
    dispatch({ type: a.recoverPassPending, payload: undefined })
    // make the call
    axios({
      method: method,
      url: restUrl,
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      dispatch({ type: a.recoverPassFulfilled, payload: response.data })
    }).catch((error) => {
      // error
      dispatch({ type: a.recoverPassRejected, payload: error })
    })
  }
}

export function changePassword(restUrl, method, formData) {
  return function (dispatch) {
    dispatch({ type: a.changePassPending, payload: undefined })
    // make the call
    axios({
      method: method,
      url: restUrl,
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      dispatch({ type: a.changePassFulfilled, payload: response.data })
    }).catch((error) => {
      // error
      dispatch({ type: a.changePassRejected, payload: error })
    })
  }
}

export function changeEmail(restUrl, method, formData) {
  return function (dispatch) {
    dispatch({ type: a.changeEmailPending, payload: undefined })
    // make the call
    axios({
      method: method,
      url: restUrl,
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      dispatch({ type: a.changeEmailFulfilled, payload: response.data })
    }).catch((error) => {
      // error
      dispatch({ type: a.changeEmailRejected, payload: error })
    })
  }
}

export function activateUser(restUrl, method, formData) {
  return function (dispatch) {
    dispatch({ type: a.activateUserPending, payload: undefined })
    // make the call
    axios({
      method: method,
      url: restUrl,
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      dispatch({ type: a.activateUserFulfilled, payload: response.data })
    }).catch((error) => {
      // error
      dispatch({ type: a.activateUserRejected, payload: error })
    })
  }
}

export function activateLink(restUrl, method, formData) {
  return function (dispatch) {
    dispatch({ type: a.activateUserPending, payload: undefined })
    // make the call
    axios({
      method: method,
      url: restUrl,
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      dispatch({ type: a.activateUserFulfilled, payload: response.data })
    }).catch((error) => {
      // error
      dispatch({ type: a.activateUserRejected, payload: error })
    })
  }
}

export function logoutUser(restUrl) {
  return function (dispatch) {
    dispatch({ type: a.logoutUserPending, payload: undefined })
    // make the call
    axios.get(restUrl).then((response) => {
      dispatch({ type: a.logoutUserFulfilled, payload: response.data })
    }).catch((error) => {
      // error
      dispatch({ type: a.logoutUserRejected, payload: error })
    })
  }
}
