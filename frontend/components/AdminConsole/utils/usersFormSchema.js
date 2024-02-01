export function getUserFormSchema(context) {
    return {
        schema: {
            title: `${context.intl.formatMessage({ id: 'perun.form_labels.user_form', defaultMessage: 'perun.form_labels.user_form' })}`,
            type: 'object',
            properties: {
                userName: {
                    type: 'string', title: `${context.intl.formatMessage({ id: 'perun.form_labels.user_name', defaultMessage: 'perun.form_labels.user_name' })}`,
                },
                firstName: {
                    type: 'string', title: `${context.intl.formatMessage({ id: 'perun.form_labels.first_name', defaultMessage: 'perun.form_labels.first_name' })}`
                },
                lastName: {
                    type: 'string', title: `${context.intl.formatMessage({ id: 'perun.form_labels.last_name', defaultMessage: 'perun.form_labels.last_name' })}`
                },
                userEmail: {
                    type: 'string', title: `${context.intl.formatMessage({ id: 'perun.form_labels.e_mail', defaultMessage: 'perun.form_labels.e_mail' })}`
                },
                pin: {
                    type: 'string', title: `${context.intl.formatMessage({ id: 'perun.form_labels.pin', defaultMessage: 'perun.form_labels.pin' })}`
                },
                userPassword: {
                    type: 'string', title: `${context.intl.formatMessage({ id: 'perun.form_labels.password_hash', defaultMessage: 'perun.form_labels.password_hash' })}`
                },
                confUserPassword: {
                    type: 'string', title: `${context.intl.formatMessage({ id: 'perun.form_labels.confirm_password_hash', defaultMessage: 'perun.form_labels.confirm_password_hash' })}`
                },
            },
            required: ['userName', 'firstName', 'lastName', 'userEmail', 'pin', 'userPassword', 'confUserPassword']
        },
        uiSchema: {

        }
    }
}
