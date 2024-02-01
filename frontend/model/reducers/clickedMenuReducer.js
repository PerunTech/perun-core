export default function clickedMenuReducer (state = {
  isClicked: '', activeItem: ''
}, action) {
  switch (action.type) {
    case 'IS_CLICKED':
      return { ...state, isClicked: action.payload }
    case 'IS_CLEARED':
      return { ...state, isClicked: '' }
    case 'SET_ACTIVE_MODULE_MENU_ITEM':
      return { ...state, activeItem: action.payload }
    case 'RESET_ACTIVE_MODULE_MENU_ITEM':
      return { ...state, isClicked: '', activeItem: '' }
    default:
      return state
  }
}
