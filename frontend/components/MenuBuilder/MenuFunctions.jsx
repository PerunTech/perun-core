import React from 'react'
import MenuRender from './MenuRender'
import ContextMenuHolder from '../Menus/ContextMenu/ContextMenuHolder'
import axios from 'axios'
import { connect } from 'react-redux'
import Modal from '../Modal/Modal'
import { GridManager, alertUser, InputElement, Dropdown } from '../../elements'
import GenericGrid from '../../elements/grid/GenericGrid'
import GenericForm from '../../elements/form/GenericForm'
import { store } from '../../model'

class MenuFunctions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      jsonmenu: '',
      gridState: false,
      formState: false,
      searchState: false,
      contextMenuLabel: '',
      fieldName: '',
      fieldValue: '',
      cssflag: 'horizontal-top',
    }
    this.assigneGridBuildFunc = this.assigneGridBuildFunc.bind(this)
    this.assigneFormBuildFunc = this.assigneFormBuildFunc.bind(this)
    this.assignSearchFormFunc = this.assignSearchFormFunc.bind(this)
    this.displayContextMenu = this.displayContextMenu.bind(this)
    this.submitSearchParams = this.submitSearchParams.bind(this)
    this.createSearchForm = this.createSearchForm.bind(this)
    this.onChange = this.onChange.bind(this)
    this.saveForm = this.saveForm.bind(this)
    this.onRowClick = this.onRowClick.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.createButton = this.createButton.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.checkClickedMenuReducer = this.checkClickedMenuReducer.bind(this)
    this.clearClicked = this.clearClicked.bind(this)
  }

  /* get menu configuration */
  componentDidMount() {
    if (this.props.moduleNameProp && this.props.wsConfGetMenuProp) {
      let {
        moduleNameProp: moduleName,
        wsConfGetMenuProp: wsConfGetMenu,
        svSession,
      } = this.props
      let type
      let component = this
      const url = `${window.server}/${wsConfGetMenu}/${svSession}/${moduleName}`
      axios
        .get(url)
        .then((response) => {
          component.setState({ jsonmenu: response.data.data })
          if (response.data.data['module_menu']?.length <= 3) {
            component.setState({ cssflag: 'horizontal-top-small' })
          } else {
            component.setState({ cssflag: 'horizontal-top' })
          }
        })
        .catch((response) => {
          type = response.response.data.type
          type = type.toLowerCase()
          this.setState({
            alert: alertUser(
              true,
              type,
              response.response.data.message,
              null,
              null
            ),
          })
        })
    } else if (this.props.customJsonProp) {
      this.setState({ jsonmenu: this.props.customJsonProp })
    } else {
      console.error(
        'Please enter moduleNameProp and wsConfGetMenuProp together or only customJsonProp as a props when rendering this Component! (customJsonProp desc: this object must contains module_menu key)'
      )
    }
  }

  /* configure onClick fn to display grid */
  assigneGridBuildFunc(conf, id, param) {
    this.checkClickedMenuReducer(id)
    let grid
    if (param === 'editable-grid') {
      grid = (
        <GenericGrid
          gridType={'READ_URL'}
          key={id + '_GRID'}
          id={id + '_GRID'}
          configTableName={conf.configuration.gridConf}
          dataTableName={conf.data.gridData}
          onRowClickFunct={this.onRowClick}
          customButton={() => this.createButton(conf, id)}
          toggleCustomButton={true}
        />
      )
      this.setState({
        gridState: grid,
        formState: false,
        contextMenuLabel: '',
        editConfState: conf,
        editConfIdState: id,
      })
      // the line below is tmp bug fix to hide search state when grid state is displayed
      this.setState({ searchState: false })
    } else {
      grid = (
        <GenericGrid
          gridType={'READ_URL'}
          key={id + '_GRID'}
          id={id + '_GRID'}
          configTableName={conf.configuration.gridConf}
          dataTableName={conf.data.gridData}
          onRowClickFunct={this.onRowClick}
        />
      )
    }
    this.setState({
      gridState: grid,
      formState: false,
      searchState: false,
      contextMenuLabel: '',
      editConfState: conf,
      editConfIdState: id,
    })
  }

  createButton(conf, id) {
    this.setState({ showEditModal: '' })
    this.assigneFormBuildFunc(conf, id, '', 'add-button')
  }

  onRowClick(gridId, rowId, row) {
    this.assigneFormBuildFunc(
      this.state.editConfState,
      this.state.editConfIdState,
      row
    )
  }

  closeModal() {
    this.setState({ showEditModal: false })
  }

  /* configure onClick func to display form */
  assigneFormBuildFunc(conf, id, row, addBtn) {
    this.checkClickedMenuReducer(id)
    if (addBtn === 'add-button') {
      // if we create new form
      let urlDataForm = conf['data']['formData']
        .replace('%session', this.props.svSession)
        .replace('%objectId', '0')
      let urlSaveForm =
        window.server +
        conf.save.formData
          .replace('%session', this.props.svSession)
          .replace('%objectId', '0')

      let uiSchema = conf['uischema']['formUi'].replace(
        '%session',
        this.props.svSession
      )
      let formMethod = conf['configuration']['fromConf'].replace(
        '%session',
        this.props.svSession
      )

      const form = (
        <GenericForm
          params={'READ_URL'}
          key={id}
          id={id}
          method={formMethod}
          uiSchemaConfigMethod={uiSchema}
          tableFormDataMethod={urlDataForm}
          addSaveFunction={(e) => this.saveForm(e, urlSaveForm, id)}
          hideBtns='closeAndDelete'
        />
      )

      this.setState({
        showEditModal: (
          <Modal
            modalTitle='insert new'
            nameSubmitBtn='close'
            closeModal={() => this.closeModal(id)}
            submitAction={() => this.closeModal(id)}
            modalContent={form}
          />
        ),
      })
      addBtn = ''
    } else {
      if (conf.type === 'editable_grid_with_form') {
        //if we edit the grid with form onRowClick
        let urlDataForm = conf['data']['formData']
          .replace('%session', this.props.svSession)
          .replace('%objectId', row[`${id}.OBJECT_ID`])
        let urlSaveForm =
          window.server +
          conf.save.formData
            .replace('%session', this.props.svSession)
            .replace('%objectId', '0')

        let uiSchema = conf['uischema']['formUi'].replace(
          '%session',
          this.props.svSession
        )
        let formMethod = conf['configuration']['fromConf'].replace(
          '%session',
          this.props.svSession
        )

        const form = (
          <GenericForm
            params={'READ_URL'}
            key={id}
            id={id}
            method={formMethod}
            uiSchemaConfigMethod={uiSchema}
            tableFormDataMethod={urlDataForm}
            addSaveFunction={(e) => this.saveForm(e, urlSaveForm, id)}
            hideBtns='closeAndDelete'
          />
        )

        this.setState({
          showEditModal: (
            <Modal
              modalTitle='Edit table row'
              nameSubmitBtn='close'
              closeModal={() => this.closeModal(id)}
              submitAction={() => this.closeModal(id)}
              modalContent={form}
            />
          ),
        })
      } else {
        let url = conf['save']['formData']
        url = window.server + url.replace('%session', this.props.svSession)
        const form = (
          <GenericForm
            params={'READ_URL'}
            key={id + '_FORM'}
            id={id + '_FORM'}
            method={conf.configuration.fromConf}
            uiSchemaConfigMethod={conf.uischema.formUi}
            tableFormDataMethod={conf.data.formData}
            addSaveFunction={(e) => this.saveForm(e, url, id)}
            hideBtns='closeAndDelete'
          />
        )

        this.setState({
          formState: form,
          gridState: false,
          contextMenuLabel: '',
          searchState: false,
        })
      }
    }
  }

  /* get search form data */
  assignSearchFormFunc(conf, id) {
    this.checkClickedMenuReducer(id)
    this.setState({ conf: conf, id: id })
    let url = conf['optionsUrl']['url']
    url = window.server + url.replace('%session', this.props.svSession)
    axios
      .get(url)
      .then((response) => {
        if (response.data) {
          this.createSearchForm(response.data.data, conf, id)
        }
      })
      .catch((response) => {
        let type
        type = response.data.type
        type = type.toLowerCase()
        this.setState({
          alert: alertUser(true, type, response.data.message, null, null),
        })
      })
  }

  /* create search form with the correct conf data */
  createSearchForm(response, conf, id) {
    let dropDownOption
    let dropDownOptionArr = []
    let searchFormArray = []
    let inputElement
    let submitButton
    if (response) {
      dropDownOption = (
        <Dropdown
          key={response}
          id='selectDropdown'
          onChange={(e) => this.onChange(e, 'dropdown')}
          options={response}
        />
      )
      inputElement = (
        <InputElement
          key='inputElement'
          name='inputElement'
          onChange={(e) => this.onChange(e, 'input')}
        />
      )
      submitButton = (
        <button
          ref={(submitBtnRef) => {
            this.submitBtnRef = submitBtnRef
          }}
          className='module-menu-button-create module-menu-btn module-menu-btn-hover-reset'
          key='searchButton'
          onClick={() => this.submitSearchParams(conf, id)}
        >
          Search
        </button>
      )
    }
    dropDownOptionArr.push(dropDownOption)
    searchFormArray.push(dropDownOption, inputElement, submitButton)
    this.setState({
      searchState: searchFormArray,
      formState: false,
      contextMenuLabel: '',
    })
    // take the search button ref and add attr
    this.submitBtnRef.setAttribute('disabled', 'disabled')
    // this.submitBtnRef.classList.add('buttonDisabled')
    this.setState({ gridState: false })
  }

  onChange(e, select) {
    if (select === 'dropdown') {
      this.setState({ fieldName: e.target.value })
    }
    if (select === 'input') {
      this.setState({ fieldValue: e.target.value })
    }
    // take the search button reference and remove attr
    this.submitBtnRef.removeAttribute('disabled')
  }

  /* reset input field value in all components, since they are independent the input val cannot be reset with a simple use of this.setState, AS */
  handleReset() {
    Array.from(document.querySelectorAll('input')).forEach(
      (input) => (input.value = '')
    )
    // the line below is not working on the input field value but clears the local component state, the upper one visualy clears the input field value and the state too, AS
    this.setState({ fieldValue: '' })
  }

  /* submit search form  */
  submitSearchParams(conf, id) {
    if (conf) {
      var confCopy = JSON.parse(JSON.stringify(conf))
      let gridConf = confCopy['configuration']['gridConf']
      let gridData = confCopy['data']['gridData']
      gridConf = gridConf.replace('%session', this.props.svSession)
      gridData = gridData
        .replace('%session', this.props.svSession)
        .replace('%fieldNAme', this.state.fieldName)
        .replace('%fieldValue', this.state.fieldValue)

      confCopy['configuration']['gridConf'] = gridConf
      confCopy['data']['gridData'] = gridData

      this.assigneGridBuildFunc(
        confCopy,
        id + this.state.fieldName + this.state.fieldValue
      )
    }
    this.handleReset()
    // when params are submited take the search button ref and set attr
    this.submitBtnRef.setAttribute('disabled', 'disabled')
  }

  /* saveForm function, url should be recieved via fn param */
  saveForm(e, paramUrl, id) {
    const th1s = this
    let restUrl
    let type
    let form_params
    restUrl = paramUrl
    form_params = e.formData

    axios({
      method: 'post',
      data: form_params,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(function (response) {
        if (response.data) {
          // type = response.data.type
          // type = type.toLowerCase()
          // th1s.setState({ alert: alertUser(true, type, response.data.message, null) })

          /* the line below should be deleted and the upper comment removed*/
          // console.log(response.data)

          // check  the line below, callback to closeModal and gridReload
          GridManager.reloadGridData(id + '_GRID')
          th1s.setState({
            alert: alertUser(true, 'success', 'Успешно зачувано', null, () =>
              th1s.closeModal(id)
            ),
            formState: false,
          })
        }
      })
      .catch(function (response) {
        // type = response.data.type
        // type = type.toLowerCase()
        // th1s.setState({ alert: alertUser(true, type, response.data.message, null, null) })

        /* the line below should be deleted and the upper comment removed*/
        th1s.setState({
          alert: alertUser(true, 'error', 'Грешка при зачувување', null, null),
        })
      })
  }

  displayContextMenu(contextMenuLabel) {
    if (this.state.contextMenuLabel !== contextMenuLabel) {
      this.setState({
        contextMenuLabel,
        formState: false,
        gridState: false,
        searchState: false,
      })
    } else {
      this.setState({ contextMenuLabel: '' })
    }
  }

  clearClicked() {
    this.setState({
      gridState: '',
      formState: '',
      searchState: '',
    })
  }

  checkClickedMenuReducer(id) {
    let href = '#/main/' + this.props.moduleNameProp
    window.history.pushState(window.history.state, '', href)
    store.dispatch({ type: 'IS_CLEARED' })
    if (this.props.isClicked !== id) {
      store.dispatch({ type: 'IS_CLICKED', payload: id })
    }
  }

  render() {
    let { customContRenderL, customContRenderR } = this.props
    return (
      <div className='module-menu-holder'>
        {this.state.showEditModal}
        <div className={this.state.cssflag}>
          {customContRenderL && (
            <div className='module-menu-flex'>{customContRenderL}</div>
          )}
          {this.state.jsonmenu['module_menu'] &&
            this.state.jsonmenu['module_menu'].map((item, i) => (
              <MenuRender
                key={i}
                moduleMenu={item}
                assigneGridBuildFunc={this.assigneGridBuildFunc}
                assigneFormBuildFunc={this.assigneFormBuildFunc}
                assignSearchFormFunc={this.assignSearchFormFunc}
                displayContextMenu={this.displayContextMenu}
                handleReset={this.handleReset}
                clearClicked={this.clearClicked}
              />
            ))}
          {customContRenderR && (
            <div className='module-menu-flex'>{customContRenderR}</div>
          )}
        </div>
        {this.state.contextMenuLabel && (
          <ContextMenuHolder
            key={this.state.contextMenuLabel}
            moduleName={this.props.moduleNameProp}
            contextMenuLabel={this.state.contextMenuLabel}
            contextMenuWS='WsConf/getContextMenu'
          />
        )}
        <div className='module-menu-data-holder'>
          {this.state.searchState && (
            <div className='module-menu-left-container'>
              <div className='module-menu-form-container'>
                {this.state.searchState}
              </div>
            </div>
          )}
          <div className='module-menu-right-container'>
            {this.state.gridState}
            {this.state.formState}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
  isClicked: state.clickedMenuReducer.isClicked,
})

export default connect(mapStateToProps)(MenuFunctions)
