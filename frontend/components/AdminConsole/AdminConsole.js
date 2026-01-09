import React, { useState, useEffect } from 'react'
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
import PerunMenu from './PerunMenu/PerunMenu'
import BusinessType from './BusinessType'
import CodeListEditor from './CodeListComp/CodeListEditor'
import WorkFlow from './WorkFlow'
import WorkFlowAutomaton from './WorkFlowAutomaton'

const AdminConsole = (_props, context) => {
    const [dynamicComponent, setDynamicComponent] = useState('UserManagement')
    const [json, setJson] = useState([])
    const setDynamicComponentFunction = (comp) => {
        setDynamicComponent(comp)
    }
    useEffect(() => {
        getMenu()
        transformIdScreen()
    }, [])
    const transformIdScreen = () => {
        const idScreen = document.getElementById('identificationScreen')
        if (idScreen) {
            idScreen.innerText = context.intl.formatMessage({
                id: 'perun.plugin.system_settings', defaultMessage: 'perun.plugin.system_settings'
            })
        }
    }
    const getMenu = () => {
        const url = `${window.location.origin}${window.assets}/json/config/AppSettings.json`
        fetch(url).then(res => res.json()).then(json => {
            if (json?.length > 0) {
                setJson(json)
            }
        }).catch(err => { throw err });
    }
    return (
        <div className="admin-console-main-container">
            {json && <ACSideMenu
                json={json}
                setDynamicComponentFunction={setDynamicComponentFunction}
            />}
            <div className="admin-console-content">
                {dynamicComponent === 'UserManagement' && <UserManagement />}
                {dynamicComponent === 'GeoLayerTypes' && <GeoLayerTypes />}
                {dynamicComponent === 'SvarogSystemParams' && <SvarogSystemParams />}
                {dynamicComponent === 'NotificationsComponent' && <NotificationsComponent />}
                {dynamicComponent === 'DirectAccess' && <DirectAccess />}
                {dynamicComponent === 'SystemConfLogs' && <SystemConfLogs />}
                {dynamicComponent === 'OrganizationalUnit' && <OrganizationalUnit />}
                {dynamicComponent === 'PerunPluginTable' && <PerunPluginTable />}
                {dynamicComponent === 'SvarogMenu' && <SvarogMenu />}
                {dynamicComponent === 'PerunMenu' && <PerunMenu />}
                {dynamicComponent === 'BusinessType' && <BusinessType />}
                {dynamicComponent === 'CodeListEditor' && <CodeListEditor />}
                {dynamicComponent === 'WorkFlow' && <WorkFlow />}
                {dynamicComponent === 'WorkFlowAutomaton' && <WorkFlowAutomaton />}
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
