export default function getRegisterSsoForm(context) {

    return {
        schema:
        {
            "title": `${context.intl.formatMessage({ id: 'perun.login.register', defaultMessage: 'perun.login.register' })}`,
            "type": "object",
            "properties": {
                "USER_NAME": {
                    "type": "string",
                    "title": `${context.intl.formatMessage({ id: 'perun.login.user_name', defaultMessage: 'perun.login.user_name' })}`,
                    "maxLength": 100
                },
                "FIRST_NAME": {
                    "type": "string",
                    "title": `${context.intl.formatMessage({ id: 'perun.form_labels.first_name', defaultMessage: 'perun.form_labels.first_name' })}`,
                    "maxLength": 200
                },
                "LAST_NAME": {
                    "type": "string",
                    "title": `${context.intl.formatMessage({ id: 'perun.form_labels.last_name', defaultMessage: 'perun.form_labels.last_name' })}`,
                    "maxLength": 200
                },
                "E_MAIL": {
                    "type": "string",
                    "title": `${context.intl.formatMessage({ id: 'perun.grid_labels.svarog_users.e_mail', defaultMessage: 'perun.grid_labels.svarog_users.e_mail' })}`,
                    "maxLength": 200
                },
                "PIN": {
                    "type": "string",
                    "title": `${context.intl.formatMessage({ id: 'perun.form_labels.pin', defaultMessage: 'perun.form_labels.pin' })}`,
                    "maxLength": 50
                },
                "TAX_ID": {
                    "type": "string",
                    "title": `${context.intl.formatMessage({ id: 'perun.grid_labels.svarog_users.tax_id', defaultMessage: 'perun.grid_labels.svarog_users.tax_id' })}`,
                    "maxLength": 50
                },
                "USER_TYPE": {
                    "type": "string",
                    "title": "User type",
                    "maxLength": 50
                }
            },
            "dependencies": {},
            "required": [
                // "USER_NAME",
                "FIRST_NAME",
                "LAST_NAME",
                "E_MAIL",
                "PIN",
                "TAX_ID",
                "USER_TYPE"
            ]
        },
        uiSchema: {
            "USER_TYPE": {
                "ui:widget": "hidden"
            },
            "USER_NAME": {
                "ui:readonly": true
            }
        },
        formData: {
            "USER_TYPE": "External"
        }
    }
}
