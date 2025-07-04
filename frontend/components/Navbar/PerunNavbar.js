import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { iconManager } from '../../assets/svg/svgHolder';
import { downloadFile } from '../../functions/utils';

const PerunNavbar = (props, context) => {
    const [toggleNavOpt, setToggleNavOpt] = useState(false)
    const [menuBurger, setMenuBurger] = useState(undefined)
    const [toggleBurger, setToggleBurger] = useState(false)
    const [img, setImg] = useState(undefined);
    const navOptRef = useRef(null);
    const burgerRef = useRef(null);

    useEffect(() => {
        if (props.userInfo.avatar) {
            downloadFile(props.userInfo.avatar, props.svSession, setImg)
        }
        function handleClickOutside(event) {
            if (navOptRef.current && !navOptRef.current.contains(event.target)) {
                setToggleNavOpt(false)
            }
            if (burgerRef.current && !burgerRef.current.contains(event.target)) {
                setToggleBurger(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (props.userInfo.avatar && props.userInfo.avatar.objectId) {
            downloadFile(props.userInfo.avatar, props.svSession, setImg)
        } else {
            setImg(undefined)
        }
    }, [props.userInfo])

    const showBurgerMenu = () => {
        setMenuBurger(JSON.parse(localStorage.getItem('bundleStorage')))
        setToggleBurger(true)
    }

    return (
        <>
            <div className='perun-navbar'>
                {/* navbar start */}
                <div className='nav-title-start'>
                    <Link to='/main' className='nav-icon' title='Home'>
                        {iconManager.getIcon('home')}
                    </Link>
                    <div className={`nav-icon-with-title ${toggleBurger && 'active'}`} title='menuBars' onClick={() => showBurgerMenu()}>
                        {iconManager.getIcon('menuBars')}
                        <p>{context.intl.formatMessage({ id: 'perun.navbar.menu', defaultMessage: 'perun.navbar.menu' })}</p>
                    </div>
                </div>
                {/* idscreen */}
                <div className='nav-title'>
                    <p id='identificationScreen'></p>
                </div>
                {/* navbar end */}
                <div onClick={() => setToggleNavOpt(true)} className={`nav-title-end ${toggleNavOpt && 'active'}`}>
                    <div className='nav-icon-with-title'>
                        {img ? <img className="my-profile-icon-avatar" src={img} alt="User Avatar" /> : iconManager.getIcon('currentUserIcon')} <p>{props.userInfo.username}</p> </div>
                    <div className='perun-navbar-arrow'>{iconManager.getIcon('arrowDown')}</div>
                </div>
                {/* navbar end toggle */}
                {toggleNavOpt && (
                    <div ref={navOptRef} className='nav-options'>
                        <div className='nav-option no-event'>
                            <p>{context.intl.formatMessage({ id: 'perun.navbar.usergr', defaultMessage: 'perun.navbar.usergr' })}</p>
                            <p>{props.userInfo.defaultUserGroup.groupName}</p>
                        </div>
                        <Link className='nav-option' to='/main/my-profile' onClick={() => setToggleNavOpt(false)} title='edit-profile'>
                            {iconManager.getIcon('edit')}
                            <p>{context.intl.formatMessage({ id: 'perun.navbar.edit', defaultMessage: 'perun.navbar.edit' })}</p>
                        </Link>
                        <div className='nav-option' onClick={() => { props.logout(), setToggleNavOpt(false) }}>
                            {iconManager.getIcon('logout')}
                            <p>{context.intl.formatMessage({ id: 'perun.navbar.logout', defaultMessage: 'perun.navbar.logout' })}</p>
                        </div>
                    </div>
                )}
            </div>
            {/* burger menu */}
            {toggleBurger && (
                <div ref={burgerRef} className='nav-burger-menu'>
                    {menuBurger.map(el => (
                        !el['cardHidden'] && (
                            <Link key={el.id} className='nav-burger-option' to={`/main/${el.id}`} onClick={() => setToggleBurger(false)}>
                                <div className='nav-burger-img'>
                                    <img src={`${window.location.origin}${el.imgPath}`} />
                                </div>
                                <p>{el.title}</p>
                            </Link>
                        )
                    ))}
                </div>
            )}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
    userInfo: state.userInfo
})

PerunNavbar.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(PerunNavbar)
