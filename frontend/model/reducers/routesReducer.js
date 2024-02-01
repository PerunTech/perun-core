export function routesReducer (state = {
// add inital routes.
}, action) {
    switch (action.type) {
        case 'refreshRoutes': {
            return {...state, ...action.value};
        } 
    }

    return state;
}