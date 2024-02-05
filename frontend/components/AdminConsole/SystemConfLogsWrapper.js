import React from 'react';
import { ComponentManager } from '../../elements';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
const { useState, useEffect } = React;
const SvarogNotesWrapper = (props) => {
    const [shouldRender, setRender] = useState(false)
    useEffect(() => {
        changeField()
    }, [])


    const changeField = () => {
        const { formid } = props
        const jsonSchema = ComponentManager.getStateForComponent(
            formid,
            "formData"
        );

        if (jsonSchema) {
            delete jsonSchema.properties['NOTE_TEXT'].format
            ComponentManager.setStateForComponent(formid, "formData", jsonSchema);
            props.formInstance.setState({ formData: jsonSchema });
            setRender(true)
        }
    }

    return (
        <>
            {shouldRender && props.children}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});
SvarogNotesWrapper.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(SvarogNotesWrapper);
