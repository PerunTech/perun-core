const REGISTER_PREFIX = 'componentIndex/'
const REMOVE = 'componentIndex/REMOVE_COMPONENT'

export default function componentIndexReducer(state = {}, action) {
  if (action.type === REMOVE) {
    const newState = { ...state }
    delete newState[action.componentId]
    return newState
  }

  if (action.type.startsWith(REGISTER_PREFIX) && action.payload) {
    const { _isBusy, ...components } = action.payload
    return { ...state, ...components }
  }

  return state
}
