export function getUserGroupsFormSchema(context) {
  return {
    schema: {
      type: 'object',
      title: `${context.intl.formatMessage({ id: 'perun.form_labels.user_groups', defaultMessage: 'perun.form_labels.user_groups' })}`,
      properties: {
        GROUP_TYPE: {
          type: 'string',
          title: `${context.intl.formatMessage({ id: 'perun.form_labels.group_type', defaultMessage: 'perun.form_labels.group_type' })}`,
          enum: ['ADMINISTRATORS', 'POWER_USERS', 'USERS'],
          enumNames: [
            `${context.intl.formatMessage({ id: 'perun.adminConsole.administrators', defaultMessage: 'perun.adminConsole.administrators' })}`,
            `${context.intl.formatMessage({ id: 'perun.adminConsole.power_users', defaultMessage: 'perun.adminConsole.power_users' })}`,
            `${context.intl.formatMessage({ id: 'perun.adminConsole.users', defaultMessage: 'perun.adminConsole.users' })}`
          ]
        },
        GROUP_SECURITY_TYPE: {
          type: 'string',
          title: `${context.intl.formatMessage({ id: 'perun.form_labels.group_security_type', defaultMessage: 'perun.form_labels.group_security_type' })}`,
          enum: ['FULL', 'POA', 'POA_OU'],
          enumNames: [
            `${context.intl.formatMessage({ id: 'perun.adminConsole.full_access', defaultMessage: 'perun.adminConsole.full_access' })}`,
            `${context.intl.formatMessage({ id: 'perun.adminConsole.power_of_attorney', defaultMessage: 'perun.adminConsole.power_of_attorney' })}`,
            `${context.intl.formatMessage({ id: 'perun.adminConsole.power_of_attorney_via_org_unit', defaultMessage: 'perun.adminConsole.power_of_attorney_via_org_unit' })}`
          ]
        },
        groupAccess: {
          type: 'string',
          title: `${context.intl.formatMessage({ id: 'perun.form_labels.group_access', defaultMessage: 'perun.form_labels.group_access' })}`,
          enum: ['FULL', 'READ'],
          enumNames: [
            `${context.intl.formatMessage({ id: 'perun.adminConsole.full_access', defaultMessage: 'perun.adminConsole.full_access' })}`,
            `${context.intl.formatMessage({ id: 'perun.adminConsole.read_only', defaultMessage: 'perun.adminConsole.read_only' })}`
          ]
        },
        GROUP_NAME: {
          type: 'string',
          title: `${context.intl.formatMessage({ id: 'perun.form_labels.group_name', defaultMessage: 'perun.form_labels.group_name' })}`,
        },
        E_MAIL: {
          type: 'string',
          title: `${context.intl.formatMessage({ id: 'perun.form_labels.e_mail', defaultMessage: 'perun.form_labels.e_mail' })}`,
        }
      },
      required: ['GROUP_TYPE', 'GROUP_SECURITY_TYPE', 'groupAccess', 'GROUP_NAME', 'E_MAIL']
    },
    uiSchema: {

    }
  }
}
