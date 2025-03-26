import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { iconManager } from '../../assets/svg/svgHolder'

const SideMenu = (props, context) => {
    const [activeElement, setActiveElement] = useState('UserManagement');
    const generateSideMenuButtons = () => {
        if (props.json && Array.isArray(props.json)) {
            return props.json.map(el => {
                return (
                    <div
                        key={el.id}
                        className={activeElement === el.component ? 'admin-console-side-item active' : 'admin-console-side-item'}
                        onClick={() => (onButtonClick(el))}
                    >
                        {iconManager.getIcon(el.icon) && <span className={'sidemenu-dynamic-comp-icon-holder'}>{iconManager.getIcon(el.icon)}</span>}<p>{context.intl.formatMessage({
                            id: `perun.admin_console.${el.id}`,
                            defaultMessage: `perun.admin_console.${el.id}`
                        })}</p>
                    </div>
                );

            });
        } else {
            return <></>;
        }
    }
    const onButtonClick = (element) => {
        if (element.component) {
            props.setDynamicComponentFunction(element.component)
            setActiveElement(element.component)
        }
    }

    return (
        <>
            <div className={`admin-console-side-menu`}>
                {generateSideMenuButtons()}
            </div>
        </>
    )
}
const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

SideMenu.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(SideMenu);