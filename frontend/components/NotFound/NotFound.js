import React from "react";
import { PropTypes } from "../../client";
import { iconManager } from "../../assets/svg/svgHolder";

const NotFound = (_props, context) => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">{iconManager.getIcon('notFound')}</div>
            <p className="not-found-title">{context.intl.formatMessage({ id: 'perun.admin_console.not_found_title', defaultMessage: 'perun.admin_console.not_found_title' })}</p>
            <p className="not-found-text">{context.intl.formatMessage({ id: 'perun.admin_console.not_found_text', defaultMessage: 'perun.admin_console.not_found_text' })}</p>
        </div>
    )
}

NotFound.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default NotFound