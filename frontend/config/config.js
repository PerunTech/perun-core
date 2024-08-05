// load labels from baseUrlPath variable
export const labelBasePath = 'perun'

// translate grid and forms
export const translateComponents = window.translateGridLabels?.toLowerCase() === 'true' || false
export const svConfig = {
  restSvcBaseUrl: window.server,
  isDebug: process.env.NODE_ENV !== 'production',
  // wsKeys: { to be changed when updaet in perun-redux is made
  triglavRestVerbs: {
    MAIN_LABELS: '/SvSecurity/i18n/%s1/%s2',
    GET_COMPONENT_CONFIGURATION: '/SvSecurity/configuration/getConfiguration/%session/%componentName',
    /* Delete records */
    // DELETE_TABLE_OBJECT: '/svWriter/deleteObject/%session/%objectId/%objectType/%objectPkId',
    DELETE_TABLE_OBJECT: '/ReactElements/deleteObject/%session',

    MAIN_VALIDATE: '/SvSSO/validateToken/%s1',
    MAIN_LOGOUT: '/SvSSO/logoff/%s1',

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

    /* Search tables with equal and like operators */
    GET_TABLE_WITH_FILTER: '/ReactElements/getTableWithFilter/%session/%objectName/%searchBy/%searchForValue/%rowlimit',
    GET_TABLE_WITH_LIKE_FILTER: '/ReactElements/getTableWithLike/%session/%objectName/%searchBy/%searchForValue/%rowlimit',
    GET_TABLE_WITH_LIKE_FILTER_SYNC: '/ReactElements/getTableWithLike/%s1/%s2/%s3/%s4/%s5',
    GET_FORM_JSON: '/ReactElements/getFormJSONSchema/%s1/%s2',

    /* Generated card */
    GET_CONFIGURATION_MODULE_CARDS: '/SvSecurity/getConfigModuleCardsEntry/',
    GET_CONFIGURATION_MODULE_DB: '/WsConf/getConfigModuleCardsEntry/',
    SEND_ACTIVATION_LINK: '/SvSecurity/sendActivationLink',
    /* Get batch type f.r */
    GET_BATCH_TYPE: '/SvBatch/getBatchJobTypes/',
    GET_JOB_TEMPLATES: '/SvBatch/getBatchJobTemplates/',
    GET_PARAMS_TEMPLATES: '/SvBatch/getParamByTemplate/',
    SAVE_JOB_TYPE: '/SvBatch/createBatchJob/',
    SAVE_BATCH_PARAMS: '/SvBatch/saveParamsByJob/',
    RUN_JOB: '/SvBatch/runBatchJob/',
    STOP_JOB: '/SvBatch/stopBatchJob',
    GET_JOBS: '/SvBatch/getBatchJob/',
    GET_JOB_INFO: '/SvBatch/getInfoForActiveJob/',
    SELECTION_JOB: '/SvBatch/selectObjects/',
    GET_CENTROID: '/SDI/getCentroidByPolyId/%s1/%s2/%s3',
    GET_TABLE_DATA: '/ReactElements/getTableData/%session/%tableName/%noRec/%doTranslate',
    CORE_LOGOUT: '/SvSecurity/logout/',
    GET_APP_TYPE: '/svReader/getAppType/',
    GET_ORG_UNIT: '/svReader/getOrgUnits/',
    GET_DROP_DOWN_VALUES: '/Iacs/getAppTypeOrgUnit/',
    GET_MULTISTEP_FORMS: '/Iacs/getForms/',
    DOWNLOAD_ZIP_FILE: '/SvBatch/getFile/',
    REMOVE_OBJ_FROM_SELECTION: '/Iacs/removeObjFromSelection/',

    /* Generate Rank */
    GET_INITIAL_RANKING_DROPDOWN: '/SvScore/getScoreTypes/',
    CHANGE_RANK_STATUS: '/SvScore/changeStatus/',
    GET_RANKING_REPORTS: '/SvScore/getReports/',
    PRINT_REPORTS: '/SvScore/generateExcel/',

    /* Generate Extraction */
    GENERATE_EXTRACTION_DROPDOWN: '/SvSample/getSampleTypes/',
    GET_EXTRACTION_REPORTS: '/SvSample/getReports/',
    CHANGE_EXT_STATUS: '/SvSample/changeStatus/',
    GET_EXTRACTION_PARAMS: '/Iacs/getSampleEnterpriseParams/',
    SAVE_EXTRACTION_PARAMS: '/Iacs/saveSampleEnterpriseParams/',
    RERUN_JOB: '/SvBatch/reRunBatchJob/',
    // REPROCESS_RANKING: '/SvScore/'

    /* Admin Console */
    CHECK_SESSION: '/SvSecurity/checkSession/',
    SAVE_FORM_WIZARD: '/WsConf/saveFormWizard/',
    SAVE_FORM_CONF: '/WsConf/saveFormConf/',
    DELETE_CARD: '/WsConf/deleteCard/',

    /* Document Manager */
    GET_SEARCH_OPTIONS: '/ElementBuilder/fetchCodeListItems/',
    GET_DOCUMENT_MANAGER_MULTISTEP: '/ElementBuilder/getForms/',
    GET_SEARCH_RESULTS: '/SDM/basicServices/getDbObjectsByFilter/%session/%filterName/%filterValue',
    SAVE_FORM_DATA: '/ReactElements/createTableRecordFormData/',
    SAVE_FORM_DATA_WITH_LINK: '/ReactElements/createTableRecord/',
    SAVE_FORM_DATA_2: '/SDM/basicServices/createTableRecord/',
    SAVE_FORM_DATA_LAST_STEP: '/ReactElements/linkObjects/',
    GET_DROPDOWN_LAST_MULTISTEP: '/ElementBuilder/fetchCodeListItemsFromTable/',
    GET_BY_CUSTOM_LINK: '/ReactElements/getObjectsByParentId/%session/%objectId/%objectName/%rowlimit',
    DELETE_DOCUMENT: '/ReactElements/deleteObject/',
    DOCUMENT_CHANGE_STATUS: '/ReactElements/changeStatus/',
  }
}