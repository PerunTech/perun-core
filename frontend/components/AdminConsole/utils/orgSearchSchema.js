export function orgSearchSchema(context) {
    return {
        schema: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.user', defaultMessage: 'perun.admin_console.user' })}`
                },
                pin: {
                    type: "string",
                    title: `${context.intl.formatMessage({ id: 'perun.adminConsole.pin', defaultMessage: 'perun.adminConsole.pin' })}`,
                },
            },
        },
        uiSchema: {}
    }
}