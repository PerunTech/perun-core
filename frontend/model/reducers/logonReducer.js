import a from '../actionNames.json'

export default function security(state = {
  isBusy: false,
  svSession: undefined,
  title: undefined,
  message: undefined,
  status: undefined,
  saml: false,
  accessAdminConsole: false,
  data: new Object
}, action) {
  switch (action.type) {
    case a.loginPending:
    case a.registerPending:
    case a.recoverPassPending:
    case a.changePassPending:
    case a.changeEmailPending:
    case a.activateUserPending:
    case a.logoutUserPending: {
      return {
        ...state,
        isBusy: true,
        svSession: undefined,
        title: undefined,
        message: undefined,
        status: undefined
      }
    }
    case a.loginRejected:
    case a.registerRejected:
    case a.recoverPassRejected:
    case a.changePassRejected:
    case a.changeEmailRejected:
    case a.activateUserRejected:
    case a.logoutUserRejected:
    case a.registerFulfilled:
    case a.recoverPassFulfilled:
    case a.changePassFulfilled:
    case a.changeEmailFulfilled:
    case a.activateUserFulfilled: {
      return {
        ...state,
        isBusy: false,
        svSession: undefined,
        title: action.payload.title,
        message: action.payload.message,
        status: action.payload.type
      }
    }
    case a.loginFulfilled: {
      return {
        ...state,
        isBusy: false,
        svSession: action.payload.data.token,
        data: action.payload.data.farmer,
        config: action.payload.data.configuration,
        title: action.payload.title,
        message: action.payload.message,
        status: action.payload.type,
      }
    }
    case a.loginSAML: {
      return {
        ...state,
        isBusy: false,
        svSession: action.payload.data.token,
        data: action.payload.data.farmer,
        config: action.payload.data.configuration,
        title: action.payload.title,
        message: action.payload.message,
        status: action.payload.type,
        saml: action.payload.saml
      }
    }
    case a.loginCustom: {
      return {
        ...state,
        isBusy: false,
        svSession: action.payload.data.token,
        data: action.payload.data,
        title: action.payload.title,
        message: action.payload.message,
        status: action.payload.type
      }
    }
    case a.logoutUserFulfilled: {
      return {
        ...state,
        isBusy: false,
        svSession: undefined,
        title: undefined,
        message: undefined,
        status: undefined,
        saml: false,
        accessAdminConsole: false
      }
    }
    case 'accessAdminConsole': {
      return { ...state, accessAdminConsole: action.payload };
    }
  }
  return state
}