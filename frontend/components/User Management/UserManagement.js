import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ComponentManager, ExportableGrid, GenericForm, Loading, GridManager, axios } from '../../client';
import { alertUser, ReactBootstrap } from '../../elements';
import Users from './Users/Users';
import Groups from './Groups/Groups';
import Privileges from './Privileges/Privileges';
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
                <p>{context.intl.formatMessage({ id: 'perun.user_mng', defaultMessage: 'perun.user_mng' })}</p>
            </div>
            <div className='user-mng-tabs'>
                <div onClick={() => setActiveFunc('USERS')} className={getTabClass('USERS')}>
                    <p>{context.intl.formatMessage({ id: 'perun.adminConsole.users', defaultMessage: 'perun.adminConsole.users' })}</p>
                </div>
                <div onClick={() => setActiveFunc('GROUPS')} className={getTabClass('GROUPS')}>
                    <p>
                        {context.intl.formatMessage({ id: 'perun.user_mng_groups', defaultMessage: 'perun.user_mng_groups' })}
                    </p>
                </div>
                <div onClick={() => setActiveFunc('PRIVILEGES')} className={getTabClass('PRIVILEGES')}>
                    <p>
                        {context.intl.formatMessage({ id: 'perun.admin_console.manage_priviledges', defaultMessage: 'perun.admin_console.manage_priviledges' })}
                    </p>
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
