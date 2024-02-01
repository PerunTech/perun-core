export function userInfoReducer (state = { username: '' }, action) {
  switch (action.type) {
    case 'GET_CURRENT_USER_NAME':
      return { ...state, username: action.payload }
    case 'RESET_CURRENT_USER_NAME':
      return { ...state, username: '' }
    default:
      return state
  }
}
