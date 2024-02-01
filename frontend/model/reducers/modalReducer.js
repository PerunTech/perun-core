import { secondaryModalIsActive, secondaryModalIsClosed } from '../actionNames.json'

export function modalReducer (state = {
  secondaryModalIsActive: false
}, action) {
  switch (action.type) {
    case secondaryModalIsActive:
      return { ...state, secondaryModalIsActive: true }
    case secondaryModalIsClosed:
      return { ...state, secondaryModalIsActive: false }
    default:
      return state
  }
}
