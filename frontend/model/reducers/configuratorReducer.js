import {addComponentConfiguration} from '../actionNames.json';

export default function configuratorReducer (state = {configuration: {}}, action) {
  if (action.type === addComponentConfiguration) {
    const newConfig = {...state.configuration, [action.key]: action.payload}
    return {...state, configuration: newConfig}
  }
  return state
}
