import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import { GridManager, alertUser, InputElement, Dropdown } from '../../../elements'
import ExportableGrid from '../../../elements/grid/ExportableGrid'
import GenericForm from '../../../elements/form/GenericForm'
import Modal from '../../Modal/Modal'
import ContextMenuItem from './ContextMenuItem'
import MainDataHolder from './MainDataHolder'

/**
 * Wrapper component for the Context menu items
 * 
 * MANDATORY PARAMETERS
 * @param {string} moduleName The name of the module that will render a Context menu
 * @param {string} contextMenuLabel The label (name) of the Context menu that will be rendered
 * @param {string} wsConfGetMenuProp The name of the WS that will return the JSON for building the Context menu
 * 
 * OPTIONAL PARAMETERS
 * @param {boolean} floatRight If passed as a prop, floatRight will tell the container to render the menu on the right-hand side of the screen
 * @param {function} customOnRowClick If passed as a prop, the custom function will be called instead of the default onRowClickFunct for grids
 * @param {any} customParam A custom param for the grid data or configuration web services
 * @param {function} customButton A function which will replace the default one for adding a new object
 * @param {string} customButtonLabel The label for the above-mentioned custom button
 * @param {function} additionalButton A function for an additional custom button in the grid toolbar
 * @param {string} additionalButtonLabel The label for the above-mentioned additional custom button
 * @param {boolean} enableMultiSelect If passed as a prop, it will make the grid rows selectable
 * @param {function} onSelectChangeFunct A function for handling the selection of multiple rows in a grid
 * @param {number} minColumnWidth A number which will tell the grid what the min-width of the column should be (in pixels)
 * @param {number} minHeight A number which will tell the grid what the min-height should be
 * @param {boolean} setInitialActive If passed as a prop, it will tell the menu items to be set as active initially
 * @param {boolean} floatDownloadBtnsToRight If passed as a prop, it will tell the ExportableGrid to align the download buttons to the right
 * @param {string} additionalClassName If passed as a prop, it will append the additional className to the container
 * @param {string} additionalDataClassName If passed as a prop, it will append the addtional className to the data container (MainDataHolder)
 */
class ContextMenuHolder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      alert: undefined,
      jsonMenu: undefined,
      gridState: false,
      formState: false,
      searchState: false,
      showEditModal: false,
      editConfState: undefined,
      editConfIdState: undefined,
      fieldName: '',
      fieldValue: ''
    }
    this.generateGrid = this.generateGrid.bind(this)
    this.generateForm = this.generateForm.bind(this)
    this.generateCustomGrid = this.generateCustomGrid.bind(this)
    this.getSearchFormData = this.getSearchFormData.bind(this)
    this.createSearchForm = this.createSearchForm.bind(this)
    this.submitSearchParams = this.submitSearchParams.bind(this)
    this.onChange = this.onChange.bind(this)
    this.saveForm = this.saveForm.bind(this)
    this.onRowClick = this.onRowClick.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.createButton = this.createButton.bind(this)
    this.handleReset = this.handleReset.bind(this)
  }

  // Get the menu configuration
  componentDidMount() {
    const { moduleName, contextMenuLabel, contextMenuWS, session } = this.props
    if (moduleName && contextMenuLabel && contextMenuWS) {
      const url = `${window.server}/${contextMenuWS}/${session}/${moduleName}`
      let data = new URLSearchParams()
      data.append('context', contextMenuLabel)
      axios({
        method: 'post',
        data,
        url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then((response) => {
        if (response.data.data.context) {
          this.setState({ jsonMenu: response.data.data.context })
        }
      }).catch((err) => {
        console.error(err)
      })
    } else {
      console.warn('Please enter the moduleName, contextMenuLabel & contextMenuWS as props when rendering the ContextMenuHolder')
    }
  }

  generateGrid(conf, id, param) {
    let grid
    if (param === 'editable-grid') {
      if (this.props.customOnRowClick) {
        if (this.props.customParam) {
          grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
            dataTableName={conf.data.gridData.replace('%customParam', this.props.customParam).replace('%customParam', this.props.customParam)}
            onRowClickFunct={this.props.customOnRowClick} minColumnWidth={this.props.minColumnWidth} minHeight={this.props.minHeight}
            floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
          />
        } else {
          grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
            dataTableName={conf.data.gridData} onRowClickFunct={this.props.customOnRowClick} minColumnWidth={this.props.minColumnWidth}
            minHeight={this.props.minHeight} floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
          />
        }
      } else {
        grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
          dataTableName={conf.data.gridData} onRowClickFunct={this.onRowClick} customButton={() => (this.createButton(conf, id))}
          toggleCustomButton={true} minColumnWidth={this.props.minColumnWidth} minHeight={this.props.minHeight}
          floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
        />
      }
      this.setState({ gridState: grid, formState: false, editConfState: conf, editConfIdState: id })
      // the line below is tmp bug fix to hide search state when grid state is displayed
      this.setState({ searchState: false })
    } else if (param === 'custom_grid') {
      if (this.props.customOnRowClick) {
        if (this.props.customParam) {
          grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
            dataTableName={conf.data.gridData.replace('%customParam', this.props.customParam).replace('%customParam', this.props.customParam)}
            onRowClickFunct={this.props.customOnRowClick} toggleCustomButton customButton={this.props.customButton}
            customButtonLabel={this.props.customButtonLabel} additionalButton={this.props.additionalButton}
            additionalButtonLabel={this.props.additionalButtonLabel} enableMultiSelect onSelectChangeFunct={this.props.onSelectChangeFunct}
            minColumnWidth={this.props.minColumnWidth} minHeight={this.props.minHeight} floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
          />
        }
      }
    } else {
      if (this.props.customOnRowClick) {
        if (this.props.customParam) {
          if (conf.gridData && conf.gridData.type === 'POST') {
            const params = conf.gridData.paramsData
            const url = `${window.server}${conf.gridData.servicePath.replace('%session', this.props.session)}`
            let data = new URLSearchParams()
            data.append('paramsData', JSON.stringify(params))
            axios({
              method: 'post', url, data,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(res => {
              if (res.data) {
                this.generateCustomGrid(res.data, conf, id)
              }
            }).catch(err => console.error(err))
          } else {
            grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
              dataTableName={conf.data.gridData.replace('%customParam', this.props.customParam).replace('%customParam', this.props.customParam)}
              onRowClickFunct={this.props.customOnRowClick} enableMultiSelect onSelectChangeFunct={this.props.onSelectChangeFunct}
              minColumnWidth={this.props.minColumnWidth} minHeight={this.props.minHeight} floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
            />
          }
        } else {
          if (this.props.onSelectChangeFunct) {
            grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
              dataTableName={conf.data.gridData} onRowClickFunct={this.props.customOnRowClick} enableMultiSelect
              onSelectChangeFunct={this.props.onSelectChangeFunct} minColumnWidth={this.props.minColumnWidth} minHeight={this.props.minHeight}
              floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
            />
          } else {
            grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
              dataTableName={conf.data.gridData} onRowClickFunct={this.props.customOnRowClick} minColumnWidth={this.props.minColumnWidth}
              minHeight={this.props.minHeight} floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
            />
          }
        }
      } else {
        grid = <ExportableGrid gridType={'READ_URL'} key={id + '_GRID'} id={id + '_GRID'} configTableName={conf.configuration.gridConf}
          dataTableName={conf.data.gridData} onRowClickFunct={this.onRowClick} minColumnWidth={this.props.minColumnWidth}
          minHeight={this.props.minHeight} floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
        />
      }
    }
    this.setState({ gridState: grid, formState: false, editConfState: conf, editConfIdState: id })
    param !== 'search' && this.setState({ searchState: false })
  }

  generateCustomGrid(gridData, conf, id) {
    const grid = <ExportableGrid gridType='SEARCH_GRID_DATA' key={id + '_GRID'} id={id + '_GRID'}
      configTableName={conf.configuration.gridConf} dataTableName={gridData} onRowClickFunct={this.props.customOnRowClick}
      enableMultiSelect onSelectChangeFunct={this.props.onSelectChangeFunct} minColumnWidth={this.props.minColumnWidth}
      minHeight={this.props.minHeight} floatDownloadBtnsToRight={this.props.floatDownloadBtnsToRight}
    />

    this.setState({ gridState: grid })
  }

  createButton(conf, id) {
    this.setState({ showEditModal: false })
    this.generateForm(conf, id, '', 'add-button')
  }

  onRowClick(gridId, rowId, row) {
    this.generateForm(this.state.editConfState, this.state.editConfIdState, row)
  }

  generateForm(conf, id, row, param) {
    if (param === 'add-button') {
      let urlDataForm = conf['data']['formData'].replace('%session', this.props.session).replace('%objectId', '0')
      let urlSaveForm = window.server + conf.save.formData.replace('%session', this.props.session).replace('%objectId', '0')
      let uiSchema = conf['uischema']['formUi'].replace('%session', this.props.session)
      let formMethod = conf['configuration']['fromConf'].replace('%session', this.props.session)

      const form = <GenericForm params={'READ_URL'} key={id} id={id} method={formMethod}
        uiSchemaConfigMethod={uiSchema} tableFormDataMethod={urlDataForm} addSaveFunction={(e) => this.saveForm(e, urlSaveForm, id)} hideBtns='closeAndDelete' />

      this.setState({ showEditModal: <Modal modalTitle='insert new' nameSubmitBtn='close' closeModal={() => this.closeModal()} submitAction={() => this.closeModal()} modalContent={form} /> })
      param = ''
    } else {
      if (conf.type === 'editable_grid_with_form') {
        let urlDataForm = conf['data']['formData'].replace('%session', this.props.session).replace('%objectId', (row[`${id}.OBJECT_ID`] || row[`${conf.tableName}.OBJECT_ID`]))
        let urlSaveForm = window.server + conf.save.formData.replace('%session', this.props.session).replace('%objectId', '0')
        let uiSchema = conf['uischema']['formUi'].replace('%session', this.props.session)
        let formMethod = conf['configuration']['fromConf'].replace('%session', this.props.session)

        const form = <GenericForm params={'READ_URL'} key={id} id={id} method={formMethod}
          uiSchemaConfigMethod={uiSchema} tableFormDataMethod={urlDataForm} addSaveFunction={(e) => this.saveForm(e, urlSaveForm, id)} hideBtns='closeAndDelete' />

        this.setState({ showEditModal: <Modal modalTitle='Edit table row' nameSubmitBtn='close' closeModal={() => this.closeModal()} submitAction={() => this.closeModal()} modalContent={form} /> })
      } else {
        let url = conf['save']['formData']
        url = window.server + url.replace('%session', this.props.session)
        const form = <GenericForm params={'READ_URL'} key={id + '_FORM'} id={id + '_FORM'} method={conf.configuration.fromConf}
          uiSchemaConfigMethod={conf.uischema.formUi} tableFormDataMethod={conf.data.formData} addSaveFunction={(e) => this.saveForm(e, url, id)} hideBtns='closeAndDelete' />

        this.setState({ formState: form, gridState: false, searchState: false })
      }
    }
  }

  saveForm(e, url, id) {
    const self = this
    const formData = e.formData

    axios({
      method: 'post',
      data: formData,
      url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(response => {
      if (response.data) {
        GridManager.reloadGridData(id + '_GRID')
        self.setState({ alert: alertUser(true, 'success', 'Успешно зачувано', null, () => self.closeModal()), formState: false })
      }
    }).catch(err => {
      console.error(err)
      self.setState({ alert: alertUser(true, 'error', 'Грешка при зачувување', null, null) })
    })
  }

  closeModal() {
    this.setState({ showEditModal: false })
  }

  getSearchFormData(conf, id) {
    this.setState({ conf, id })
    let url = conf['optionsUrl']['url']
    url = window.server + url.replace('%session', this.props.session)
    axios.get(url).then(response => {
      if (response.data) {
        this.createSearchForm(response.data.data, conf, id)
      }
    }).catch(err => {
      console.error(err)
      let type = err.data.type
      type = type.toLowerCase()
      this.setState({ alert: alertUser(true, type, err.data.message, null, null) })
    })
  }

  createSearchForm(response, conf, id) {
    let dropDownOption
    let dropDownOptionArr = []
    let searchFormArray = []
    let inputElement
    let submitButton
    if (response) {
      dropDownOption = <Dropdown
        key={id}
        id='selectDropdown'
        onChange={e => this.onChange(e, 'dropdown')}
        options={response}
      />
      inputElement = <InputElement key='inputElement' name='inputElement' onChange={(e) => this.onChange(e, 'input')} />
      submitButton = <button
        ref={submitBtnRef => { this.submitBtnRef = submitBtnRef }}
        className='module-menu-button-create module-menu-btn-secondary module-menu-btn-hover-reset'
        key='searchButton'
        onClick={() => this.submitSearchParams(conf, id)}>
        Search
      </button>
    }
    dropDownOptionArr.push(dropDownOption)
    searchFormArray.push(dropDownOptionArr, inputElement, submitButton)
    this.setState({ searchState: searchFormArray, formState: false })
    // take the search button ref and add attr
    this.submitBtnRef.setAttribute('disabled', 'disabled')
    this.setState({ gridState: false })
  }

  onChange(e, inputType) {
    if (inputType === 'dropdown') {
      this.setState({ fieldName: e.target.value })
    }
    if (inputType === 'input') {
      this.setState({ fieldValue: e.target.value })
    }
    // take the search button reference and remove attr
    this.submitBtnRef.removeAttribute('disabled')
  }

  handleReset() {
    Array.from(document.querySelectorAll('input')).forEach(input => (input.value = ''))
    this.setState({ fieldValue: '' })
  }

  submitSearchParams(conf, id) {
    if (conf) {
      let confCopy = JSON.parse(JSON.stringify(conf))
      let gridConf = confCopy['configuration']['gridConf']
      let gridData = confCopy['data']['gridData']
      gridConf = gridConf.replace('%session', this.props.session)
      gridData = gridData.replace('%session', this.props.session).replace('%fieldNAme', this.state.fieldName).replace('%fieldValue', this.state.fieldValue)

      confCopy['configuration']['gridConf'] = gridConf
      confCopy['data']['gridData'] = gridData

      this.generateGrid(confCopy, id + this.state.fieldName + this.state.fieldValue, 'search')
    }
    this.handleReset()
    // when params are submited take the search button ref and set attr
    this.submitBtnRef.setAttribute('disabled', 'disabled')
  }

  render() {
    const { floatRight, setInitialActive, additionalClassName, additionalDataClassName } = this.props
    const { gridState, formState, searchState, showEditModal, jsonMenu } = this.state
    const { generateGrid, generateForm, getSearchFormData } = this
    // Check if the floatRight prop exists & apply the container className accordingly
    let containerClassName = 'context-menu-vertical-left'
    let floatHolder = ''
    if (floatRight) {
      containerClassName = 'context-menu-vertical-right'
      floatHolder = 'context-menu-data-holder-left'
    }
    if (additionalClassName) {
      containerClassName += ` ${additionalClassName}`
    }
    return (
      <div id='context_menu_container'>
        {showEditModal}
        <div className={`${containerClassName} context-menu-fade-in`}>
          {jsonMenu && jsonMenu.map(item => (
            <ContextMenuItem
              key={item.id}
              itemId={item.id}
              contextMenuItem={item}
              generateGrid={generateGrid}
              generateForm={generateForm}
              getSearchFormData={getSearchFormData}
              setInitialActive={setInitialActive}
            />
          ))}
        </div>
        <MainDataHolder
          floatHolder={floatHolder || 'context-menu-data-holder-right'}
          additionalDataClassName={additionalDataClassName}
          gridState={gridState}
          formState={formState}
          searchState={searchState}
        />
      </div>
    )
  }
}

ContextMenuHolder.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  session: state.security.svSession
})

export default connect(mapStateToProps)(ContextMenuHolder)
