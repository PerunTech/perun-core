import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ComponentManager, ExportableGrid, GenericForm, Modal } from '../../client'

/* name of the table, if needed change only here */
const tableName = 'SVAROG_ACL'
class SvarogAclGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showAclModal: '',
    }
  }

  componentDidMount() {
    this.getInitGrid()
  }

  componentWillUnmount() {
    this.setState({ grid: '' })
    ComponentManager.cleanComponentReducerState(tableName)
  }

  getInitGrid = () => {
    let grid = <ExportableGrid
      gridType={'READ_URL'}
      key={tableName}
      id={tableName}
      configTableName={'/ReactElements/getTableFieldList/%session/' + tableName}
      dataTableName={'/ReactElements/getTableData/%session/' + tableName + '/0'}
      onRowClickFunct={this.onRowClick}
      heightRatio={0.75}
      refreshData={true}
    />
    ComponentManager.setStateForComponent(tableName, null, {
      onRowClickFunct: this.onRowClick,
    })

    this.setState({ grid: grid })
  }

  onRowClick = (gridId, rowId, row) => {
    const selectedObjId = row[`${tableName}.OBJECT_ID`]
    this.showModal(selectedObjId)
  }

  showModal = (objectId) => {
    let modalData = <GenericForm
      params={'READ_URL'}
      key={tableName + '_FORM'}
      id={tableName + '_FORM'}
      method={'/ReactElements/getTableJSONSchema/%session/' + tableName}
      uiSchemaConfigMethod={'/ReactElements/getTableUISchema/%session/' + tableName}
      tableFormDataMethod={'/ReactElements/getTableFormData/%session/' + objectId + '/' + tableName}
      hideBtns='all'
    />
    let aclModal = <Modal customClassBtnModal='customClassBtnModal'
      closeModal={this.closeModal}
      closeAction={this.closeModal}
      modalContent={modalData}
      modalTitle={this.context.intl.formatMessage({ id: 'perun.admin_console.show_access_code', defaultMessage: 'perun.admin_console.show_access_code' })}
      nameCloseBtn={this.context.intl.formatMessage({ id: 'perun.adminConsole.close', defaultMessage: 'perun.adminConsole.close' })}
    />
    this.setState({ showAclModal: aclModal })
  }

  closeModal = () => {
    this.setState({ showAclModal: false })
  }


  render() {
    const { grid, showAclModal } = this.state
    return (
      <React.Fragment>
        <div className='admin-console-grid-container'>{grid}</div>
        {showAclModal}
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

SvarogAclGrid.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(SvarogAclGrid)
