export default function getLabelSearchSchema(context) {
    const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id });
    return {
        schema: {
            title: fmt('perun.admin_console.search_label'),
            type: 'object',
            properties: {
                LABEL_CODE: {
                    type: 'string',
                    title: fmt('perun.admin_console.search_label_code'),
                },
                LABEL_TEXT: {
                    type: 'string',
                    title: fmt('perun.admin_console.search_label_text'),
                },
            },
        },
        uiSchema: {},
    };
}
