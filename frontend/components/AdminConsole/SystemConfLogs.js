import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Modal } from '../../client'
import SystemConfLogsWrapper from './SystemConfLogsWrapper'

const tableName = 'SVAROG_CONFIG_LOG'
class SystemConfLogs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount() {
    this.generateSystemLogsGrid()
  }

  componentWillUnmount() {
    ComponentManager.cleanComponentReducerState(tableName)
  }

  generateSystemLogsGrid = () => {
    let grid = <ExportableGrid
      className={'hide-all-form-legends'}
      gridType={'READ_URL'}
      key={tableName}
      id={tableName}
      configTableName={'/ReactElements/getTableFieldList/%session/' + tableName}
      dataTableName={'/ReactElements/getFullTableData/%session/' + tableName + '/0/true'}
      onRowClickFunct={this.onRowClick}
      heightRatio={0.75}
      refreshData={true}
    />
    this.setState({ grid: grid })
    ComponentManager.setStateForComponent(tableName, null, {
      onRowClickFunct: this.onRowClick,
    })
  }

  onRowClick = (gridId, rowId, row) => {
    const selectedObjId = row[`${tableName}.OBJECT_ID`]
    this.showModal(selectedObjId)
  }

  showModal = (parentId) => {
    let formName = 'SVAROG_NOTES'
    let modalData = <GenericForm
      params={'READ_URL'}
      key={tableName + '_FORM'}
      id={tableName + '_FORM'}
      method={'/ReactElements/getTableJSONSchema/%session/' + formName}
      uiSchemaConfigMethod={'/ReactElements/getTableUISchema/%session/' + formName}
      tableFormDataMethod={'/ReactElements/getFormDataByParentId/%session/' + parentId + '/' + formName}
      hideBtns='all'
      inputWrapper={SystemConfLogsWrapper}
    />
    let loginfo = <Modal customClassBtnModal='customClassBtnModal'
      closeModal={this.closeModal}
      closeAction={this.closeModal}
      modalContent={modalData}
      modalTitle={this.context.intl.formatMessage({ id: 'perun.system.logs.preview', defaultMessage: 'perun.system.logs.preview' })}
      nameCloseBtn={this.context.intl.formatMessage({ id: 'perun.generalLabel.close', defaultMessage: 'perun.generalLabel.close' })}
    />
    this.setState({ showLogModal: loginfo })
  }

  closeModal = () => {
    this.setState({ showLogModal: false })
  }

  render() {
    const { grid, showLogModal } = this.state
    return (
      <React.Fragment>
        {showLogModal}
        <div className='admin-console-grid-container'>{grid}</div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

SystemConfLogs.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(SystemConfLogs)
