export default function businessLogicReducer(state = {}, action) {
    switch (action.type) {
        case "SAVE":
            return { ...state, [action.payload.key]: action.payload.value };
        default:
            return state;
    }
}