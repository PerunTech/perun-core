import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ACSideMenu from './ACSideMenu'
// COMPONENTS
import UserManagement from '../User Management/UserManagement'
import OrganizationalUnit from './OrgUnit/OrganizationalUnit'
import NotificationsComponent from './NotificationsComponent'
import DirectAccess from './DirectAccess'
import SystemConfLogs from './SystemConfLogs'
import SvarogSystemParams from './SvarogSystemParams'
import GeoLayerTypes from './GeoLayerTypes'
import PerunPluginTable from './PerunPluginTable'
import SvarogMenu from './SvarogMenu'
import BusinessType from './BusinessType'
const json = [

    {
        "id": "user_mng",
        "component": "UserManagement",
        "icon": "editUserSecondary"
    },
    {
        "id": "announcement",
        "component": "NotificationsComponent",
        "icon": "infoIconSecondary"
    },
    {
        "id": "all_executors",
        "function": "executors",
        "icon": "executorsList"
    },
    {
        "id": "direct_access_card",
        "component": "DirectAccess",
        "icon": "managePrivilegesSecondary"
    },
    {
        "id": "svarog_config_log",
        "component": "SystemConfLogs",
        "icon": "infoIconSecondary"
    },
    {
        "id": "svarog_system_params",
        "component": "SvarogSystemParams",
        "icon": "managePrivilegesSecondary"
    },
    {
        "id": "geo_layer_types",
        "component": "GeoLayerTypes",
        "icon": "geoLayerTypes"
    },
    {
        "id": "perun_plugin_table_editor",
        "component": "PerunPluginTable",
        "icon": "managePrivilegesSecondary"
    },
    {
        "id": "svarog_menus_editor",
        "component": "SvarogMenu",
        "icon": "managePrivilegesSecondary"
    },
    {
        "id": "business_type",
        "component": "BusinessType",
        "icon": "managePrivilegesSecondary"
    }

]


const AdminConsole = (props, context) => {
    const [dynamicComponent, setDynamicComponent] = useState('UserManagement')
    const setDynamicComponentFunction = (comp) => {
        setDynamicComponent(comp)
    }
    return (
        <div className="admin-console-main-container">
            <ACSideMenu
                json={json}
                setDynamicComponentFunction={setDynamicComponentFunction}
            />
            <div className="admin-console-content">
                {dynamicComponent === 'UserManagement' && <UserManagement />}
                {dynamicComponent === 'SvarogAclGrid' && <SvarogAclGrid />}
                {dynamicComponent === 'GeoLayerTypes' && <GeoLayerTypes />}
                {dynamicComponent === 'SvarogSystemParams' && <SvarogSystemParams />}
                {dynamicComponent === 'NotificationsComponent' && <NotificationsComponent />}
                {dynamicComponent === 'CreateAclCodes' && <CreateAclCodes />}
                {dynamicComponent === 'DirectAccess' && <DirectAccess />}
                {dynamicComponent === 'SystemConfLogs' && <SystemConfLogs />}
                {dynamicComponent === 'OrganizationalUnit' && <OrganizationalUnit />}
                {dynamicComponent === 'LabelEditor' && <LabelEditor />}
                {dynamicComponent === 'CodeListEditor' && <CodeListEditor />}
                {dynamicComponent === 'PerunPluginTable' && <PerunPluginTable />}
                {dynamicComponent === 'SvarogMenu' && <SvarogMenu />}
                {dynamicComponent === 'BusinessType' && <BusinessType />}
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

AdminConsole.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(AdminConsole);
