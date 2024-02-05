import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { store, lastSelectedItem, saveFormData } from '../../../../model';
import { ComponentManager, FormManager } from '../../..';

class EditSelectedItem extends React.Component {
  static propTypes = {
    showForm: PropTypes.string.isRequired,
    objectId: PropTypes.number,
    parentId: PropTypes.number,
    source: PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = { formToRender: undefined }
    this.generateFormFromSourceFile = this.generateFormFromSourceFile.bind(this)
    this.generateFormFromDbConfig = this.generateFormFromDbConfig.bind(this)
    this.updateSelectedRecord = this.updateSelectedRecord.bind(this)
    this.customSave = this.customSave.bind(this)
  }

  generateFormFromSourceFile(props) {
    const showForm = props.showForm
    const objectId = props.objectId
    const parentId = props.parentId
    const formId = `${showForm}_FORM_${objectId}`
    const params = []
    params.push({
      PARAM_NAME: 'formWeWant',
      PARAM_VALUE: showForm
    }, {
      PARAM_NAME: 'session',
      PARAM_VALUE: props.svSession
    }, {
      PARAM_NAME: 'object_id',
      PARAM_VALUE: objectId
    }, {
      PARAM_NAME: 'table_name',
      PARAM_VALUE: showForm
    }, {
      PARAM_NAME: 'parent_id',
      PARAM_VALUE: parentId
    })
    const dataForm = FormManager.generateForm(
      formId, formId,
      params, 'formData', 'GET_FORM_BUILDER', 'GET_UISCHEMA', 'GET_TABLE_FORMDATA',
      null, null, null, null, null, null, 'close', this.updateSelectedRecord
    )
    ComponentManager.setStateForComponent(formId, null, { onAlertClose: this.updateSelectedRecord })
    this.setState({ formToRender: dataForm })
  }

  generateFormFromDbConfig(props) {
    let dataForm
    const showForm = props.showForm
    const objectId = props.objectId
    const formId = `${showForm}_FORM_${objectId}`
    let uneditable = props.hideBtns || 'close'
    const deleteEnabled = props.deleteEnabled
    if (deleteEnabled) {
      uneditable = 'delete'
    }
    let columnsStyle = 'structuredForm'
    if (!props.numberOfColumns || props.numberOfColumns === 2) {
      dataForm = FormManager.generateStructuredForm(formId, formId,
        undefined, 'formData', props.configuration, props.uischema, props.data,
        null, this.customSave, null, null, null, null, columnsStyle, this.updateSelectedRecord, uneditable)
    } else if (props.numberOfColumns === 3) {
      columnsStyle = 'adminForm'
      dataForm = FormManager.generateStructuredForm(formId, formId,
        undefined, 'formData', props.configuration, props.uischema, props.data,
        null, this.customSave, null, null, null, null, columnsStyle, this.updateSelectedRecord, uneditable)
    } else if (props.numberOfColumns === 1) {
      dataForm = FormManager.generateForm(formId, formId,
        undefined, 'formData', props.configuration, props.uischema, props.data,
        null, this.customSave, null, null, null, null, uneditable, this.updateSelectedRecord)
    }
    ComponentManager.setStateForComponent(formId, null,
      { onAlertClose: this.updateSelectedRecord, addSaveFunction: this.customSave })
    this.setState({ formToRender: dataForm })
  }

  UNSAFE_componentWillMount() {
    if (this.props.showForm) {
      if (this.props.source === 'database') this.generateFormFromDbConfig(this.props)
      else this.generateFormFromSourceFile(this.props)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.gridLang && (this.props.gridLang !== nextProps.gridLang)) {
      this.forceUpdate()
    }
    if (this.props.showForm !== nextProps.showForm || this.props.objectId !== nextProps.objectId ||
      this.props.parentId !== nextProps.parentId) {
      if (nextProps.source === 'database') this.generateFormFromDbConfig(nextProps)
      else this.generateFormFromSourceFile(nextProps)
    }
  }

  updateSelectedRecord() {
    // update currently selected record in global state
    const selectedRecords = this.props.selectedRecords
    const comps = selectedRecords.length
    const row = selectedRecords[comps - 1].row
    const gridId = selectedRecords[comps - 1].gridId
    const showForm = this.props.showForm
    const componentState = ComponentManager.getStateForComponent(`${showForm}_FORM_${this.props.objectId}`, 'formTableData')
    const newState = {}
    for (const key in componentState) {
      if (componentState.hasOwnProperty(key) && componentState[key]) {
        const newKey = `${showForm}.${key}`
        newState[newKey] = componentState[key]
        for (const rowKey in row) {
          if (row.hasOwnProperty(rowKey)) {
            if (newKey === rowKey) {
              row[rowKey] = newState[newKey]
            } else if (newKey !== rowKey && !row[newKey]) {
              row[newKey] = newState[newKey]
            }
          }
        }
      }
    }
    ComponentManager.setStateForComponent(gridId, 'rowClicked', row)
    store.dispatch(lastSelectedItem(gridId, row))
    if (this.props.refreshComponent && this.props.refreshMenuOnSubmit) {
      this.props.refreshComponent()
    }
  }

  customSave(formData) {
    const p = this.props
    const showForm = p.showForm
    const objectId = p.objectId
    const formId = `${showForm}_FORM_${objectId}`
    let defaultSaveParams = []
    defaultSaveParams = defaultSaveParams.filter(item => item.PARAM_NAME !== 'jsonString')
    defaultSaveParams.push({
      PARAM_NAME: 'jsonString',
      PARAM_VALUE: JSON.stringify(formData.formData)
    })
    saveFormData(formId, p.onSave, p.svSession, defaultSaveParams, true)
  }

  render() {
    return (
      <div>
        {this.state.formToRender}
      </div>
    )
  }
}

EditSelectedItem.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
  selectedRecords: state.gridConfig.gridHierarchy,
  gridLang: state.intl.locale
})
export default connect(mapStateToProps)(EditSelectedItem)
