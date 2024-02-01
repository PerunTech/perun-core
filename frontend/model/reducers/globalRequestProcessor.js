import * as a from '../actionNames.json'

export default function globalRequestProcessor (state = {
  result: undefined,
  error: undefined,
  isBusy: false
}, action) {
  switch (action.type) {
    case a.transitionPending:
    case a.calculationPending: {
      return {...state, result: action.payload, error: undefined, isBusy: true}
    } case a.transitionFulfilled:
    case a.calculationFulfilled: {
      return {...state, result: action.payload, error: undefined, isBusy: false}
    } case a.transitionRejected:
    case a.calculationRejected: {
      return {...state, result: undefined, error: action.payload, isBusy: false}
    } case 'CLEAN_PROCESSOR_STATE': {
      return {...state, result: action.payload, error: action.payload, isBusy: false}
    }
  }
  return state
}
