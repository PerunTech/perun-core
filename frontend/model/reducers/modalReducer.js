import a from '../actionNames.json'

export function modalReducer(state = {
  secondaryModalIsActive: false
}, action) {
  switch (action.type) {
    case a.secondaryModalIsActive:
      return { ...state, secondaryModalIsActive: true }
    case a.secondaryModalIsClosed:
      return { ...state, secondaryModalIsActive: false }
    default:
      return state
  }
}
