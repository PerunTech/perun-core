export function userDropDownListSchema(context) {
    return {
        schema: {
            type: "object",
            properties: {
                username: {
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.user', defaultMessage: 'perun.admin_console.user' })}`,
                    type: "string",
                },
                pin: {
                    title: `${context.intl.formatMessage({ id: 'perun.adminConsole.pin', defaultMessage: 'perun.adminConsole.pin' })}`,
                    type: "string",
                },
            },
        },
        uiSchema: {},
    }
}