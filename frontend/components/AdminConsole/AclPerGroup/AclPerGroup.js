import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, GenericGrid } from '../../../client'
let prev
const AclPerGroup = (props, context) => {
    const [flag, setFlag] = useState(false)
    useEffect(() => {
        setFlag(true)
        return () => {
            ComponentManager.cleanComponentReducerState(prev)
        }
    }, [])

    const generateAclGrid = () => {
        ComponentManager.cleanComponentReducerState(prev)
        let gridId = 'ACL_PER_GROUP_GRID_' + Math.floor(Math.random() * 999999).toString(36)
        prev = gridId
        return <GenericGrid
            key={gridId}
            id={gridId}
            gridType={'READ_URL'}
            configTableName={`/WsAdminConsole/get-acl-by-group-field-list/sid/${props.svSession}`}
            dataTableName={`/WsAdminConsole/get-acl-by-group/sid/${props.svSession}/group_object_id/${props.groupId}`}
            minHeight={450}
        />

    }
    return (
        <>
            <div className='aclpergroup-container'>
                <h3 className='aclpergroup-legend'>
                    {context.intl.formatMessage({ id: 'perun.adminConsole.acl_per_group_legend', defaultMessage: 'perun.adminConsole.acl_per_group_legend' })}
                </h3>
                <div>
                    {flag && generateAclGrid()}
                </div>
            </div>
        </>
    )
}

const mapStateToProps = state => ({
    svSession: state.security.svSession
})

AclPerGroup.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(AclPerGroup)
