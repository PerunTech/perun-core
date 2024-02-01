import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Form from 'react-jsonschema-form';
// import {menuConfig} from 'config/menuConfig.js'

class DocumentsForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showForm: false,
      jsonSchema: undefined,
      formData: undefined
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.json !== nextProps.json) {
      if (nextProps.json && nextProps.json.data) {
        this.setState({ showForm: true, jsonSchema: nextProps.json.data })
      }
    }
    if (this.props.formData !== nextProps.formData) {
      if (nextProps.formData && nextProps.formData.data) {
        this.setState({ formData: nextProps.formData.data })
      }
    }
  }

  componentDidMount () {
    this.props.documentsReduxAction('YES_NO_JSON', this.props.svSession, this.props.objectId, this.props.parentTypeId, 'dropdown')
    this.props.documentsReduxAction('YES_NO_FORM', this.props.svSession, this.props.objectId, this.props.parentTypeId, 'dropdown')
    if (this.props.json && this.props.json.data) {
      this.setState({ showForm: true, jsonSchema: this.props.json.data })
    }
    if (this.props.formData && this.props.formData.data) {
      this.setState({ formData: this.props.formData.data })
    }
  }

  render () {
    return (
      <div>
        {this.state.showForm && <Form
          className='form-test'
          schema={this.state.jsonSchema ? this.state.jsonSchema : null}
          uiSchema={this.state.jsonSchema ? this.state.jsonSchema : null}
          formData={this.state.formData ? this.state.formData : null}
          onSubmit={() => console.log('SAVE')}
          showErrorList={false}
        />}
      </div>
    )
  }
}

DocumentsForm.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
  formData: state.documentsReducer.formData,
  json: state.documentsReducer.json
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  documentsReduxAction: (triglav_method, svSession, parentId, parentTypeId, component) => {
    if (ownProps.documentsAction) {
      dispatch(ownProps.documentsAction(triglav_method, svSession, parentId, parentTypeId, component))
    } else {
      console.warn('No documentsAction prop passed from main project')
    }
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentsForm)
