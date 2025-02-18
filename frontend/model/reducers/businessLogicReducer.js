export default function businessLogicReducer(state = {}, action) {
    switch (action.type) {
        case "SAVE":
            return { ...state, ...action.payload };
        default:
            return state;
    }
}