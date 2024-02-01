import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { store } from '../../model';
import { ExportableGrid } from '../../elements';

class DocManEditQuestionsSectorGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      generateGrid: null
    }
    this.onRowClick = this.onRowClick.bind(this)
    this.gridWithCustomFn = this.gridWithCustomFn.bind(this)
  }

  componentDidMount() {
    let component = this
    /* since the component is rendered in two parent components, we must check the comming props to this component */
    if (component.props.object_id) {
      this.gridWithCustomFn(component.props.object_id)
    } else if (component.props.objId) {
      this.gridWithCustomFn(component.props.objId)
    } else {
      console.log('err')
    }
  }

  onRowClick(documentManagerGrid, rowId, row) {
    const questionObjId = row['SVAROG_FORM_FIELD_TYPE.OBJECT_ID']
    const questionObjType = row['SVAROG_FORM_FIELD_TYPE.OBJECT_TYPE']
    const questionLabelCode = row['SVAROG_FORM_FIELD_TYPE.LABEL_CODE']
    this.props.onQuestionClick(questionObjId, questionObjType, questionLabelCode)
  }

  /* get grid */
  gridWithCustomFn() {
    /* check object id and put in id and key for the grid */
    let varObj = this.props.object_id ? this.props.object_id : this.props.objId
    let documentManagerGrid = <ExportableGrid
      id={'SVAROG_FORM_FIELD_TYPE' + varObj}
      key={'SVAROG_FORM_FIELD_TYPE' + varObj}
      configTableName='CUSTOM_GRID'
      dataTableName='GET_BY_CUSTOM_LINK'
      params={[
        {
          PARAM_NAME: 'session',
          PARAM_VALUE: store.getState().security.svSession
        }, {
          PARAM_NAME: 'objectName',
          PARAM_VALUE: 'SVAROG_FORM_FIELD_TYPE'
        }, {
          PARAM_NAME: 'gridConfigWeWant',
          PARAM_VALUE: 'SVAROG_FORM_FIELD_TYPE'
        }, {
          PARAM_NAME: 'rowlimit',
          PARAM_VALUE: '1000'
        }, {
          PARAM_NAME: 'objectId',
          PARAM_VALUE: this.props.object_id ? this.props.object_id : this.props.objId
        }
      ]}
      gridType='CUSTOM'
      onRowClickFunct={this.onRowClick}
      enableMultiSelect={true}
      showCheckbox={true}
    />
    this.setState(
      { generateGrid: documentManagerGrid }
    )
  }

  render() {
    const { generateGrid } = this.state
    return (
      <div>{generateGrid}</div>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

DocManEditQuestionsSectorGrid.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(
  mapStateToProps
)(DocManEditQuestionsSectorGrid)