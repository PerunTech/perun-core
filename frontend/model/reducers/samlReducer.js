export function samlReducer(state = { saml: true }, action) {
    switch (action.type) {
        case 'SAML_FLAG':
            return { ...state, saml: action.payload }
        default:
            return state
    }
}
