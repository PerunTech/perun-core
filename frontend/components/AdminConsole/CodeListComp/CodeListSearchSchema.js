export default function getDDOptionsFormSchema(context) {
    const labels = [
        `${context.intl.formatMessage({ id: 'perun.admin_console.search_label_code', defaultMessage: 'perun.admin_console.search_label_code' })}`,
        `${context.intl.formatMessage({ id: 'perun.admin_console.search_label_text', defaultMessage: 'perun.admin_console.search_label_text' })}`
    ]
    const values = ['LABEL_CODE', 'LABEL_TEXT']
    return {
        schema: {
            title: `${context.intl.formatMessage({ id: 'perun.admin_console.code_list_search', defaultMessage: 'perun.admin_console.code_list_search' })}`,
            type: 'object',
            properties: {
                SEARCH_OPTION: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.choose_search', defaultMessage: 'perun.admin_console.choose_search' })}`,
                    enum: values,
                    enumNames: labels
                },
                SEARCH_VALUES: {
                    type: 'string',
                    title: `${context.intl.formatMessage({ id: 'perun.admin_console.search_bar_input', defaultMessage: 'perun.admin_console.search_bar_input' })}`,
                    placeholder: `${context.intl.formatMessage({ id: 'perun.admin_console.search_value', defaultMessage: 'perun.admin_console.search_value' })}`,
                }
            }
        },
    }
}
