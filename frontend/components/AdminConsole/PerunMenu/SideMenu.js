import React from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import { GenericGrid, ComponentManager } from '../../../client';
import { iconManager } from '../../../assets/svg/svgHolder';
const { useState, useEffect } = React;
const config = [
    {
        "ID": "farm-summary",
        "LABEL": "farm-summary"
    },
    {
        "ID": "PERSON_0",
        "label": "Business owner"
    },
    {
        "ID": "HOLDING_0",
        "label": "Holding"
    },
    {
        "ID": "ADDRESS_0",
        "label": "Contact information"

    },
    {
        "ID": "FARM_MEMBERS_0",
        "label": "Associated persons"

    },
    {
        "ID": "TEST_PHARM",
        "label": "Control Chart",
        "data": [
            {
                "ID": "OFFICIAL_CONTROL_CHART_0",
                "label": "Control Overview"
            },
            {
                "ID": "PHARM_SELL_VMP_0",
                "label": "Pharmacies Selling VMP"
            }
        ]
    },
    {
        "ID": "BANKACC_0",
        "label": "Bank account"
    },
    {
        "ID": "FILES_0",
        "label": "Attachments"
    },
    {
        "ID": "BOTTLE_TEST",
        "label": "Control Chart",
        "data": [
            {
                "ID": "OFFICIAL_CONTROL_CHART_0",
                "label": "Control Overview"
            },
            {
                "ID": "PHARM_SELL_VMP_0",
                "label": "Pharmacies Selling VMP"
            }
        ]
    },
    {
        "ID": "DOCUMENTS_0",
        "label": "Documents"
    },
    {
        "ID": "FEES_0",
        "label": "Fees"
    },
    {
        "ID": "PHARMACY_SELLING_VMP_CONTROL_CHART_0",
        "label": "Control Chart",
        "data": [
            {
                "ID": "OFFICIAL_CONTROL_CHART_0",
                "label": "Control Overview"
            },
            {
                "ID": "PHARM_SELL_VMP_0",
                "label": "Pharmacies Selling VMP"
            }
        ]
    }
]
const SideMenu = (props, context) => {
    const [activeElement, setActiveElement] = useState('');
    const [activeChild, setActiveChild] = useState('');
    const [activeParent, setActiveParent] = useState('');
    useEffect(() => {
        return () => {
            const splitID = activeElement.replace(/\d/g, '').replace(/_$/, '');
            ComponentManager.cleanComponentReducerState(splitID);
        }
    }, []);

    const generateSideMenuButtons = (configuration) => {
        if (configuration && Array.isArray(configuration)) {
            return configuration.map(el => {
                let modifiedID = el.ID.replace(/\d/g, '').replace(/_$/, '');
                if (!el.ID.toUpperCase().includes('SUMMARY')) {
                    return (
                        <>
                            <button id={el.ID} className={`sidemenu-btn_sub ${activeElement === el.ID && !el.data && 'sidemenu-active'}`}
                                onClick={() => (el.data ? setActive(el) : onButtonClick(el))}>
                                <span className='sidemenu-btn-title'><p>{el.label}</p></span>
                                {el.data && (<span className={`expand-arrow ${el.ID === activeParent && 'rotate-expand'}`}>{iconManager.getIcon('arrowDown')}</span>)}
                            </button>
                            {el.data && (
                                <div className={el.ID === activeParent ? 'sidemenu-sub-item-active' : 'sidemenu-sub-item-hidden'}>
                                    {el.data.map(sub => {
                                        modifiedID = sub.ID.replace(/\d/g, '').replace(/_$/, '');
                                        return (<button key={sub.ID} className={`sidemenu-btn_sub ${activeChild === sub.ID && 'sidemenu-active'}`}>
                                            <span className="sidemenu-btn-title"><p>{sub.label}</p>  </span> </button>);
                                    })}
                                </div>
                            )}
                        </>
                    );
                }
            });
        } else { return <></>; }

    };
    const onButtonClick = (element, childEl) => {
        const splitID = activeElement.replace(/\d/g, '').replace(/_$/, '');
        ComponentManager.cleanComponentReducerState(splitID);
        const id = element.ID;
        if (childEl) {
            setActiveChild(id)
            setActiveElement('')
        } else {
            setActiveElement(id)
            setActiveChild('')
        }
    }

    const setActive = (el) => {
        if (el.ID === activeParent) {
            setActiveParent('');
        } else { setActiveParent(el.ID); }

    };
    const generateGrid = () => {
        const splitID = activeElement.replace(/\d/g, '').replace(/_$/, '');
        return <GenericGrid
            gridType={"SEARCH_GRID_DATA"}
            key={splitID}
            id={splitID}
            configTableName={`/ReactElements/getTableFieldList/${props.svSession}/${splitID}`}
            dataTableName={[]}
            heightRatio={0.65}
        />
    }

    return (
        <div className='preview-menu-container'>
            {props.configuration && <div className={`sidemenu-main-container preview-sidemenu`} id="sidemenu-main-container"> {generateSideMenuButtons(config)}</div>}
            <div className='preview-menu-grid'>
                {activeElement && generateGrid()}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

SideMenu.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(SideMenu);