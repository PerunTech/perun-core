export function userInfoReducer(state = { username: '', userObjectId: '', defaultUserGroup: undefined, avatar: undefined }, action) {
  switch (action.type) {
    case 'GET_CURRENT_USER_NAME':
      return { ...state, username: action.payload }
    case 'RESET_CURRENT_USER_NAME':
      return { ...state, username: '' }
    case 'GET_CURRENT_USER_DATA':
      return { ...state, ...action.payload }
    case 'RESET_USER_DATA':
      return { username: '', userObjectId: '', defaultUserGroup: undefined, avatar: undefined }
    default:
      return state
  }
}
