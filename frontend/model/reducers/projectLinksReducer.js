export default function projectLinksReducer(state = { data: {} }, action) {
    switch (action.type) {
        case "GET_PROJECT_LINKS":
            return { ...state, data: action.payload }
        default: return state
    }
}
