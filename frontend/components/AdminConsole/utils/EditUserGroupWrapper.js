import React from 'react';
import { ComponentManager } from '../../../client';
import { connect } from 'react-redux'
class EditUserGroupWrapper extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            reRender: false
        }
    }

    componentDidMount() {
        this.handleUiSchema()
    }



    handleUiSchema = () => {
        const { formid } = this.props;
        const uiSchema = ComponentManager.getStateForComponent(formid, 'uischema')
        if (uiSchema) {
            uiSchema['GROUP_UID'] = { 'ui:widget': 'hidden' }
            ComponentManager.setStateForComponent(formid, null, { 'uischema': uiSchema })
            this.props.formInstance.setState({ 'uischema': uiSchema })
            this.setState({ reRender: true })
        }
    }


    render() {
        return (
            <React.Fragment>
                {this.state.reRender && this.props.children}
            </React.Fragment>
        )
    }
}



const mapStateToProps = (state) => ({
    svSession: state.security.svSession,

});

export default connect(mapStateToProps)(EditUserGroupWrapper);