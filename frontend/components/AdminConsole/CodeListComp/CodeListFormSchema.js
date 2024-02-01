export default function getLabelFormSchema(context) {
    const labels = [
        `${context.intl.formatMessage({ id: 'perun.admin_console.locale_mk', defaultMessage: 'perun.admin_console.locale_mk' })}`,
        `${context.intl.formatMessage({ id: 'perun.admin_console.locale_en', defaultMessage: 'perun.admin_console.locale_en' })}`,
        `${context.intl.formatMessage({ id: 'perun.admin_console.locale_sq', defaultMessage: 'perun.admin_console.locale_sq' })}`
    ]
    const values = ['mk_MK', 'en_US', 'sq_AL']
    return {
        schema: {
            title: `${context.intl.formatMessage({ id: 'perun.admin_console.add_code_list_editor', defaultMessage: 'perun.admin_console.add_code_list_editor' })}`,
            type: 'object',
            properties: {
                //SVAROG CODES
                CODE_VALUE: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.svarog_code_value', defaultMessage: 'perun.admin_console.svarog_code_value' })}`,
                },
                PARENT_CODE_VALUE: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.svarog_parent_code_value', defaultMessage: 'perun.admin_console.svarog_parent_code_value' })}`,
                },
                //SVAROG LABELS
                LABEL_CODE: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.inscription_code', defaultMessage: 'perun.admin_console.inscription_code' })}`,
                },
                LABEL_TEXT: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.svarog_label_code', defaultMessage: 'perun.admin_console.svarog_label_code' })}`,
                },
                LOCALE_ID: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.language', defaultMessage: 'perun.admin_console.language' })}`,
                    enum: values,
                    enumNames: labels
                },
                LABEL_DESCR: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.description', defaultMessage: 'perun.admin_console.description' })}`,
                },
                SORT_ORDER: {
                    type: 'integer',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.svarog_order', defaultMessage: 'perun.admin_console.svarog_order' })}`,
                }
            }
        },
        uiSchema: {
            PARENT_CODE_VALUE: { "ui:readonly": true }
        }
    }
}
