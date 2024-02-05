import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { dataToRedux } from '../../../../model';
import { FormManager } from '../../..';

class EditSingleRecord extends React.Component {
  static propTypes = {
    showForm: PropTypes.string.isRequired,
    parentId: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    this.state = { formToRender: undefined }
    this.generateForm = this.generateForm.bind(this)
    this.getSingleObjectByParentId = this.getSingleObjectByParentId.bind(this)
  }

  generateForm(props, objectId) {
    const showForm = props.showForm
    const parentId = props.parentId
    const svSession = props.svSession
    let formId = `${showForm}_FORM`
    const params = []
    params.push({
      PARAM_NAME: 'formWeWant',
      PARAM_VALUE: showForm
    }, {
      PARAM_NAME: 'session',
      PARAM_VALUE: svSession
    }, {
      PARAM_NAME: 'table_name',
      PARAM_VALUE: showForm
    }, {
      PARAM_NAME: 'parent_id',
      PARAM_VALUE: parentId
    })
    if (objectId) {
      params.push({
        PARAM_NAME: 'object_id',
        PARAM_VALUE: objectId
      })
      formId = `${showForm}_FORM_${objectId}`
    } else {
      params.push({
        PARAM_NAME: 'object_id',
        PARAM_VALUE: '0'
      })
    }
    const dataForm = FormManager.generateForm(
      formId, formId, params, 'formData',
      'GET_FORM_BUILDER', 'GET_UISCHEMA', 'GET_TABLE_FORMDATA',
      null, null, null, null, null, null, 'close'
    )
    this.setState({ formToRender: dataForm })
  }

  getSingleObjectByParentId(props) {
    let objectId
    dataToRedux((response) => {
      if (response.length) {
        objectId = response[0][`${props.showForm}.OBJECT_ID`]
      }
      this.generateForm(props, objectId)
    }, null, null, 'GET_BYPARENTID_SYNC', props.svSession, props.parentId, props.showForm, 1)
  }

  UNSAFE_componentWillMount() {
    if (this.props.showForm) {
      this.getSingleObjectByParentId(this.props)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.showForm !== nextProps.showForm || this.props.parentId !== nextProps.parentId) {
      this.getSingleObjectByParentId(nextProps)
    }
  }

  render() {
    return (
      <div>
        {this.state.formToRender}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})
export default connect(mapStateToProps)(EditSingleRecord)
