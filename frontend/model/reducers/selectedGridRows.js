export function selectedGridRows (state = { selectedGridRows: [], gridId: null }, action) {
  if (action.type === 'UPDATE_SELECTED_GRID_ROWS') {
    return {...state, selectedGridRows: action.payload[0] || [], gridId: action.payload[1] || null}
  } else {
    return state
  }
}