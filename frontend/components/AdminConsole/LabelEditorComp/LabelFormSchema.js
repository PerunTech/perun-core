export default function getLabelFormSchema(context) {
    const labels = [
        `${context.intl.formatMessage({ id: 'perun.admin_console.locale_mk', defaultMessage: 'perun.admin_console.locale_mk' })}`,
        `${context.intl.formatMessage({ id: 'perun.admin_console.locale_en', defaultMessage: 'perun.admin_console.locale_en' })}`,
        `${context.intl.formatMessage({ id: 'perun.admin_console.locale_sq', defaultMessage: 'perun.admin_console.locale_sq' })}`
    ]
    const values = ['mk_MK', 'en_US', 'sq_AL']
    return {
        schema: {
            title: `${context.intl.formatMessage({ id: 'perun.admin_console.add_title', defaultMessage: 'perun.admin_console.add_title' })}`,
            type: 'object',
            required: ['LABEL_CODE', 'LABEL_TEXT', 'LOCALE_ID'],
            properties: {
                LABEL_CODE: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.title_code', defaultMessage: 'perun.admin_console.title_code' })}`,
                },
                LABEL_TEXT: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.label_title', defaultMessage: 'perun.admin_console.label_title' })}`,
                },
                LABEL_DESCR: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.description', defaultMessage: 'perun.admin_console.description' })}`,
                },
                LOCALE_ID: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.language', defaultMessage: 'perun.admin_console.language' })}`,
                    enum: values,
                    enumNames: labels
                },
            }
        },
        uiSchema: {

        }
    }
}
