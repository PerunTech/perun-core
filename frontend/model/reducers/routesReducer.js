export function routesReducer(state = {
  loading: false,
}, action) {
  switch (action.type) {
    case 'fetchingRoutes': {
      return { ...state, loading: action.payload }
    }
    case 'refreshRoutes': {
      return { ...state, ...action.value };
    }
  }

  return state;
}