import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../client';
import { alertUser, ReactBootstrap } from '../../elements';
import Users from './Users';
import Groups from './Groups';
import Privileges from './Privileges';
const { Modal } = ReactBootstrap;

const UserManagement = (props, context) => {
    const [activeTab, setActiveTab] = useState('USERS');

    const setActiveFunc = (tab) => {
        setActiveTab(tab);
    };

    const getTabClass = (tab) => (tab === activeTab ? 'user-tab-title active' : 'user-tab-title');

    return (
        <div className='user-mng'>
            <div className='user-mng-header'>
                <p>User Management</p>
            </div>
            <div className='user-mng-tabs'>
                <div onClick={() => setActiveFunc('USERS')} className={getTabClass('USERS')}>
                    <p>Users</p>
                </div>
                <div onClick={() => setActiveFunc('GROUPS')} className={getTabClass('GROUPS')}>
                    <p>Groups</p>
                </div>
                <div onClick={() => setActiveFunc('PRIVILEGES')} className={getTabClass('PRIVILEGES')}>
                    <p>Privileges</p>
                </div>
            </div>
            <div>
                {activeTab === 'USERS' && <Users />}
                {activeTab === 'GROUPS' && <Groups />}
                {activeTab === 'PRIVILEGES' && <Privileges />}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

UserManagement.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(UserManagement);
