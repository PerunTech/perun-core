import a from '../actionNames.json';

export default function configuratorReducer(state = { configuration: {} }, action) {
  if (action.type === a.addComponentConfiguration) {
    const newConfig = { ...state.configuration, [action.key]: action.payload }
    return { ...state, configuration: newConfig }
  }
  return state
}
