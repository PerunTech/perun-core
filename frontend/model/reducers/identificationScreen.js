export default function identificationScreenReducer(state = { idScreenLocation: '/main' }, action) {
    switch (action.type) {
        case "WRITE_IDSCREEN":
            return { ...state, idScreenLocation: action.payload };
        default:
            return state;
    }
}