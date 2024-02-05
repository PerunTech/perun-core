import a from '../actionNames.json'

export default function contextMenuItemsReducer(state = {
  clickedContextMenuItemId: '',
  clickedSubMenuItemId: ''
}, action) {
  switch (action.type) {
    case a.contextMenuItemWasClicked:
      return { ...state, clickedContextMenuItemId: action.payload }
    case a.subMenuItemWasClicked:
      return { ...state, clickedSubMenuItemId: action.payload }
    case a.clearContextMenuItems:
      return { ...state, clickedContextMenuItemId: '', clickedSubMenuItemId: '' }
    default:
      return state
  }
}
