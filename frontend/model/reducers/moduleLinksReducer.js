export default function moduleLinksReducer(state = { data: [] }, action) {
    switch (action.type) {
        case "GET_MODULE_LINKS":
            return { ...state, data: action.payload }
        default: return state
    }
}
