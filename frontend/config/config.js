// load labels from baseUrlPath variable
export const labelBasePath = 'perun'

// translate grid and forms
export const translateComponents = window.translateGridLabels?.toLowerCase() === 'true' ? true : false

export const svConfig = {
  restSvcBaseUrl: window.server,
  isDebug: process.env.DEBUG === 'true',
  triglavRestVerbs: {
    MAIN_LABELS: '/SvSecurity/i18n/%s1/%s2',
    GET_COMPONENT_CONFIGURATION: '/SvSecurity/configuration/getConfiguration/%session/%componentName',
    DELETE_TABLE_OBJECT: '/ReactElements/deleteObject/%session',
    MAIN_VALIDATE: '/SvSSO/validateToken/%s1',
    MAIN_LOGOUT: '/SvSSO/logoff/%s1',
    CORE_LOGOUT: '/SvSecurity/logout/',
    /* Datagrid configuration and data */
    BASE: '/ReactElements/getTableFieldList/%session/%gridName',
    BASE_DATA: '/ReactElements/getTableData/%session/%gridConfigWeWant/100000',
    GET_BYPARENTID: '/ReactElements/getObjectsByParentId/%session/%parentId/%objectType/%rowlimit',
    GET_BYPARENTID_SYNC: '/ReactElements/getObjectsByParentId/%s1/%s2/%s3/%s4',
    GET_BYPARENTID_SORT_BY_OBJID: '/ReactElements/getObjectsByParentId/%session/%parentId/%objectType/%rowlimit/%sortByField',
    GET_BYLINK: '/ReactElements/getObjectByLink/%session/%parentId/%objectType/%linkName/%rowlimit',
    CUSTOM_GRID: '/ReactElements/getTableFieldList/%session/%gridConfigWeWant',
    /* Json schema form configuration and data */
    GET_FORM_BUILDER: '/ReactElements/getTableJSONSchema/%session/%formWeWant',
    GET_UISCHEMA: '/ReactElements/getTableUISchema/%session/%formWeWant',
    GET_TABLE_FORMDATA: '/ReactElements/getTableFormData/%session/%object_id/%table_name',
    GET_DATA_FROM_FORM_MAVEN: '/ReactElements/getTableFormData/%session/%object_id/%table_name',
    GET_UISCHEMA_MAVEN: '/ReactElements/getTableUISchema/%session/%formWeWant',
    GET_FORM_BUILDER_MAVEN: '/ReactElements/getTableJSONSchema/%session/%formWeWant',
    /* Json schema form documents */
    GET_DOC_BUILDER: '/ReactElements/getFormJSONSchema/%session/%formWeWant',
    GET_DOC_UISCHEMA: '/ReactElements/getFormUISchema/%session/%formWeWant',
    GET_DOC_FORMDATA: '/ReactElements/getFormFormData/%session/%object_id/%formWeWant',
    SAVE_DOCUMENT_OBJECT: '/ReactElements/createFormWithFields/%session/%parentId/%form_type/%form_validation/%value/%json_string',
    GET_MULTIFILTER_TABLE: '/ReactElements/getTableWithFilter/%s1/%s2/%s3/%s4/%s5/%s6/%s7/%s8',
    GET_DOCUMENTS: '/ReactElements/getTableData/%s1/%s2/%s3',
    GET_DOCUMENT_FORM_FILED_LIST: '/ReactElements/getTransposedFormByParentFieldList/%session/%form_id/%scenario',
    GET_DOCUMENT_FORMS: '/ReactElements/getTransposedFormByParent/%session/%parent_id/%form_id',
    GET_DOCUMENTS_BY_PARENTID: '/ReactElements/getDocumentsByParentId/%session/%parentId/%formName/%recordNumber',
    /* Custon save records */
    SAVE_OBJECT_WITH_LINK: '/table/createTableRecord/%session/%table_name/%parent_id/%jsonString/%object_id_to_link/%table_name_to_link/%link_name/%link_note',
    SAVE_FORM_DATA: '/ReactElements/createTableRecordFormData/',
    /* Search tables with equal and like operators */
    GET_TABLE_WITH_FILTER: '/ReactElements/getTableWithFilter/%session/%objectName/%searchBy/%searchForValue/%rowlimit',
    GET_TABLE_WITH_LIKE_FILTER: '/ReactElements/getTableWithLike/%session/%objectName/%searchBy/%searchForValue/%rowlimit',
    GET_TABLE_WITH_LIKE_FILTER_SYNC: '/ReactElements/getTableWithLike/%s1/%s2/%s3/%s4/%s5',
    GET_FORM_JSON: '/ReactElements/getFormJSONSchema/%s1/%s2',
    /* Cards */
    GET_CONFIGURATION_MODULE_CARDS: '/SvSecurity/getConfigModuleCardsEntry/',
    GET_CONFIGURATION_MODULE_DB: '/WsConf/getConfigModuleCardsEntry/',
    SEND_ACTIVATION_LINK: '/SvSecurity/sendActivationLink',
    /* Admin Console */
    SAVE_FORM_CONF: '/WsConf/saveFormConf/',
    DELETE_CARD: '/WsConf/deleteCard/',
  }
}
