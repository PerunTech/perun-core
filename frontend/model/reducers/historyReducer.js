export function historyReducer (state = {
  count: 0,
  history: []
}, action) {
  switch (action.type) {
    case 'persist/REHYDRATE': {
      let historyReducer
      if (action.payload.historyReducer) {
        historyReducer = action.payload.historyReducer
      } else {
        historyReducer = state
      }
      return { ...historyReducer }
    }
  }
  return state
}
