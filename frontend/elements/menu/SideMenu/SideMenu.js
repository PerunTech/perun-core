import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import createHashHistory from 'history/createHashHistory';

import { menuConfig, svConfig } from '../../../config';
import { ReduxNavigator } from '../..';

// import {ExecuteActionOnSelectedRows} from '../../../components/ComponentsIndex' // Where is this from ?

import EditSingleRecord from './ReturnedComponents/EditSingleRecord';
import EditSelectedItem from './ReturnedComponents/EditSelectedItem';
import GridContent from './ReturnedComponents/GridContent';
import MultiGrid from './ReturnedComponents/MultiGrid';
import DocumentsForm from './DocumentsForm';
import PreviewData from './PreviewData';
import defaultCSS from './SideMenu.module.css';

const hashHistory = createHashHistory()

let sideMenuStyle = ''
// Import Project CSS
import('modulesCSS/SideMenu.module.css').then((projectCSS) => {
  // Check if class is present in css, temporary workaround of webpack bug
  // true code should be in catch block
  // github issue https://github.com/webpack/webpack/issues/5662
  if (!projectCSS.checkIfCSSisPresent) {
    console.log('No external style for SideMenu.module.css')
    // load defaultCSS
    sideMenuStyle = defaultCSS
  } else {
    sideMenuStyle = projectCSS
  }
  return sideMenuStyle
}).catch(() => {
  // this block never executes and blocks webpack-dev-server terminal
  // webpack bug
  console.log('No external style for SideMenu.module.css')
})

// side menu rendered depending on selected item from main top menu
// functions called by the side menu items are defined in the parent component, result from those functions
// are passed to the other child (grid/form - right component)
// optional prop - Record Info used to display selected item from main menus
class SideMenu extends React.Component {
  static propTypes = {
    menuType: PropTypes.string.isRequired,
    stateTooltip: PropTypes.bool.isRequired,
    parentId: PropTypes.number.isRequired,
    objectId: PropTypes.number.isRequired,
    configuration: PropTypes.func.isRequired,
    componentStack: PropTypes.array,
    lastSelectedItem: PropTypes.func.isRequired
    // dataSource: PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = {
      listItemId: undefined,
      isActive: false,
      /* documents: undefined, */
      returnedComponent: undefined,
      stateTooltip: this.props.stateTooltip
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.stateTooltip !== nextProps.stateTooltip) {
      this.setState({ stateTooltip: nextProps.stateTooltip })
    }
  }

  generateForm(varType, isSingle) {
    if (isSingle) {
      this.setState({
        returnedComponent: <EditSingleRecord
          showForm={varType}
          parentId={this.props.objectId}
          key={`${varType}_${this.props.objectId}_${this.props.menuType}`}
        />
      })
    } else {
      this.setState({
        returnedComponent: <EditSelectedItem
          showForm={varType}
          parentId={this.props.parentId}
          objectId={this.props.objectId}
          key={`${varType}_${this.props.objectId}`}
        />
      })
    }
  }

  generateGrid(varType, isContainer, linkName, linkedTable, linkNote,
    actionsEnabled, multiGrid) {
    let toggleCustomButton = false
    let formFieldsToBeEcluded
    menuConfig('SIMPLE_FORM_EXCLUDE') && menuConfig('SIMPLE_FORM_EXCLUDE').LIST_OF_ITEMS.map((element) => {
      // check if 'ANIMAL' === 'ANIMAL'
      // to use excluded simple grid button
      if (varType === element.TABLE) {
        toggleCustomButton = true
        formFieldsToBeEcluded = element.EXCLUDED_FIELDS
      }
    })
    menuConfig('SHOW_GRIDMODAL_TO_LINK_TO_TABLE') && menuConfig('SHOW_GRIDMODAL_TO_LINK_TO_TABLE').map((element) => {
      if ((linkedTable === element.TABLE) && element.LINKS) {
        element.LINKS.map(
          linksElement => {
            if (linksElement === linkName) {
              toggleCustomButton = true
            }
          }
        )
      }
    })

    const gridConfig = menuConfig('GRID_CONFIG', this.context.intl)
    const gridProps = {
      gridInModal: this.props.gridInModal,
      toggleCustomButton: toggleCustomButton,
      formFieldsToBeEcluded: formFieldsToBeEcluded,
      enableMultiSelect: this.props.enableMultiSelect,
      onSelectChangeFunct: this.props.onSelectChangeFunct,
      showGrid: varType,
      parentId: this.props.objectId,
      isContainer: isContainer,
      linkName: linkName,
      linkNote: linkNote,
      linkedTable: linkedTable,
      gridConfig: gridConfig,
      multiGrid: multiGrid,
      key: `${varType}_${this.props.objectId}`
    }
    if (multiGrid) {
      this.setState({
        returnedComponent: <div>
          {/* {actionsEnabled &&
          <ExecuteActionOnSelectedRows gridId={gridProps.key} />
        } */}
          <MultiGrid {...gridProps} />
        </div>
      })
    } else {
      this.setState({
        returnedComponent: <div>
          {/* {actionsEnabled &&
          <ExecuteActionOnSelectedRows gridId={gridProps.key} />
        } */}
          <GridContent {...gridProps} />
        </div>
      })
    }
  }

  /*
  generateDocument (docId) {
    this.setState({returnedComponent: <GetDocumentsForParent
      formName={docId}
      parentId={this.props.objectId}
      key={docId + '_' + this.props.objectId} />
    })

    this.setState({returnedComponent: <GetDocumentsForObject
      formName={docId}
      parentId={this.props.objectId}
      key={docId + '_' + this.props.objectId} />
    })
  }
*/
  showLpis() {
    hashHistory.push('/main/lpis')
  }

  showPrint(farmId) {
    const url = `${svConfig.restSvcBaseUrl}/printGenerator/printFarmDetails/${this.props.svSession}/${farmId}`
    window.open(url, 'Application print' + 'Farm Details', '')
  }

  highlightActivatedElement(listItemId) {
    this.setState({ isActive: true, listItemId })
  }

  renderDocuments = () => this.setState({ returnedComponent: <DocumentsForm {...this.props} /> })

  componentDidMount() {
    if (menuConfig(`SIDE_MENU_${this.props.menuType}`, this.context.intl) && menuConfig(`SIDE_MENU_${this.props.menuType}`, this.context.intl).LIST_OF_ITEMS) {
      menuConfig(`SIDE_MENU_${this.props.menuType}`, this.context.intl).LIST_OF_ITEMS.map(
        element => {
          if (element.TYPE === this.props.menuType && element.SELECTED_BY_DEFAULT) {
            document.getElementById(element.ID) && document.getElementById(element.ID).click()
          }
        }
      )
    }
  }

  render() {
    const {
      returnedComponent, stateTooltip, isActive, listItemId
    } = this.state
    const {
      menuType, objectId, componentStack, lastSelectedItem, configuration
    } = this.props
    let htmlBuffer = []
    const documentBuffer = []
    let documentsFound = 0
    if (menuType) {
      const configedMenu = menuConfig(`SIDE_MENU_${menuType}`, this.context.intl)
      var listOfButtons = configedMenu.LIST_OF_ITEMS
      for (let i = 0; i < listOfButtons.length; i++) {
        const obj = listOfButtons[i]
        const varKey = obj.ID
        const varId = obj.ID
        const varLabel = obj.LABEL
        const varFunc = obj.FUNCTION
        const varType = obj.TYPE
        const linkName = obj.LINKNAME
        const linkNote = obj.LINKNOTE
        const linkedTable = obj.LINKEDTABLE
        const isSingle = obj.ISSINGLE
        const isContainer = obj.ISCONTAINER
        const floatHelper = obj.FLOATHELPER
        const isDocument = obj.DOCUMENT
        const actionsEnabled = obj.ACTIONS_ENABLED
        const multiGrid = obj.MULTIGRID

        const htmlElement =
          (<li
            id={varId}
            key={varKey}
            type='button'
            data-tip={floatHelper}
            data-effect='float'
            data-event-off='mouseout'
            {...varFunc === 'grid' && { onClick: () => { this.highlightActivatedElement(varId); this.generateGrid(varType, isContainer, linkName, linkedTable, linkNote, actionsEnabled, multiGrid) } }}
            {...varFunc === 'form' && { onClick: () => { this.highlightActivatedElement(varId); this.generateForm(varType, isSingle) } }}
            {...varFunc === 'lpis' && { onClick: () => { this.showLpis() } }}
            {...varFunc === 'print' && { onClick: () => { this.showPrint(objectId) } }}
            {...varFunc === 'documents' && { onClick: () => { this.highlightActivatedElement(varId); this.renderDocuments() } }}
            {...isActive && listItemId === varId
              ? { className: `list-group-item ${sideMenuStyle.li_item} ${sideMenuStyle.li_item_clicked}` }
              : { className: `list-group-item ${sideMenuStyle.li_item}` }
            }
          >
            {varLabel}
          </li>)
        if (isDocument) {
          documentsFound++
          documentBuffer.push(htmlElement)
        } else {
          htmlBuffer.push(htmlElement)
        }
      }
      /* if (this.props.documentsList) {
        var documents = []
        var documentsList = this.props.documentsList
        for (let i = 0; i < documentsList.length; i++) {
          const docId = documentsList[i]['SVAROG_FORM_TYPE.OBJECT_ID']
          const label = documentsList[i]['SVAROG_FORM_TYPE.LABEL_CODE']
          const documentForm =
            <li id={docId}
              key={docId}
              type='button'
              className='li_item'
              // data-tip={floatHelper}
              // data-effect='float'
              // data-event-off='mouseout'
              onClick={() => this.generateDocument(docId)}
              >
              {label}
            </li>
          documents.push(documentForm)
        }
      } */
    } else {
      htmlBuffer = null
    }

    return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        {stateTooltip && <ReactTooltip />}
        <div
          id='searchDiv'
          className={sideMenuStyle.sideDiv}
        >
          {this.props.children}
          <ul id='sidemenu_list' className={`list-group ${sideMenuStyle.ul_item}`}>
            {htmlBuffer}
            {documentsFound > 0 &&
              <ul
                id='displayDocuments'
                className={sideMenuStyle.ul_item}
              >
                <input id='documents_btn' type='checkbox' />
                <label id='documents_label' className={sideMenuStyle.collapsibleMenuHeading} htmlFor='documents_btn'>
                  Documents
                  <span id='collapsible_indicator' className={`${sideMenuStyle.collapsibleIndicator} glyphicon glyphicon-menu-down`} />
                </label>
                <ul id='sidemenu_documents' className={`${sideMenuStyle.ul_item} ${sideMenuStyle.collapsibleMenu}`}> {documentBuffer} </ul>
              </ul>}
          </ul>
        </div>
        <div
          id='displayContent'
          className='displayContent'
        >
          <ReduxNavigator
            key='ReduxNavigator'
            componentStack={componentStack}
            lastSelectedItem={lastSelectedItem}
            configuration={configuration}
          />
          {this.props.statusBadges && <this.props.statusBadges {...this.props} />}
          {returnedComponent || <PreviewData items={listOfButtons} componentStack={componentStack} configuration={configuration} />}
        </div>
      </div>
    )
  }
}

SideMenu.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
  stateTooltip: state.stateTooltip.stateTooltip
})

export default connect(mapStateToProps)(SideMenu)
