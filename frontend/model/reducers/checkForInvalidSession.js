export default function checkForInvalidSession (state = {
  exceptionTitle: undefined,
  exceptionMessage: undefined
}, action) {
  if (action.payload) {
    let errTitle
    let errMsg
    if (action.payload.type === 'EXCEPTION') {
      try {
        errTitle = action.payload.title
        errMsg = action.payload.message
      } catch (err) {
        errTitle = undefined
        errMsg = undefined
      }
    }
    return {...state, exceptionTitle: errTitle, exceptionMessage: errMsg}
  }
  return state
}
