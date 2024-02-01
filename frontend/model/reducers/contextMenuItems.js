import { contextMenuItemWasClicked, subMenuItemWasClicked, clearContextMenuItems } from '../actionNames.json'

export default function contextMenuItemsReducer (state = {
  clickedContextMenuItemId: '',
  clickedSubMenuItemId: ''
}, action) {
  switch (action.type) {
    case contextMenuItemWasClicked:
      return { ...state, clickedContextMenuItemId: action.payload }
    case subMenuItemWasClicked:
      return { ...state, clickedSubMenuItemId: action.payload }
    case clearContextMenuItems:
      return { ...state, clickedContextMenuItemId: '', clickedSubMenuItemId: '' }
    default:
      return state
  }
}
