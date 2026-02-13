export function admConsoleFormData (state = [], action) {
  switch (action.type) {
    case 'ADD_ADM_CONSOLE_FORM_DATA': {
      const exists = state.some(item => item.OBJECT_ID === action.payload.OBJECT_ID)
      if (exists) {
        return state.map(item =>
          item.OBJECT_ID === action.payload.OBJECT_ID ? action.payload : item
        )
      }
      return [...state, action.payload]
    }

    case 'REMOVE_ADM_CONSOLE_FORM_DATA': {
      return state.filter(item => item.OBJECT_ID !== action.payload)
    }

    case 'UPDATE_ADM_CONSOLE_FORM_DATA': {
      return state.map(item =>
        item.OBJECT_ID === action.payload.OBJECT_ID ? { ...item, ...action.payload } : item
      )
    }

    case 'REPLACE_ALL_ADM_CONSOLE_FORM_DATA': {
      return action.payload
    }

    case 'CLEAN_ADM_CONSOLE_FORM_DATA': {
      return []
    }

    default: {
      return state
    }
  }
}
