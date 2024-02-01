export function formData (state = {
  formData: undefined
}, action) {
  switch (action.type) {
    case 'FETCH_FORM_FULFILLED': {
      return {...state, formData: action.payload}
    }
  }
  return state
}
