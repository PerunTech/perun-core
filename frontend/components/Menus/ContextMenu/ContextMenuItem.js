import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { store } from '../../../model'
import { ComponentManager } from '../../../elements'
import { iconManager } from '../../../assets/svg/svgHolder'
import { iconManager as menuIconsManager } from '../../../assets/svg/menuIcons'

class ContextMenuItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isActive: false,
      activeSubMenuItem: ''
    }
    this.onClick = this.onClick.bind(this)
    this.onSubMenuItemClick = this.onSubMenuItemClick.bind(this)
    this.configureMenuItems = this.configureMenuItems.bind(this)
  }

  componentDidMount() {
    if (this.props.setInitialActive) {
      this.setState({ isActive: true })
      store.dispatch({ type: 'CONTEXT_MENU_ITEM_WAS_CLICKED', payload: this.props.itemId })
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.clickedContextMenuItemId !== this.props.itemId) {
      this.setState({ isActive: false })
    }

    if (this.state.activeSubMenuItem && (nextProps.clickedSubMenuItemId !== this.state.activeSubMenuItem) &&
      (nextProps.clickedContextMenuItemId !== this.props.itemId)) {
      this.setState({ activeSubMenuItem: '' })
    }
  }

  componentWillUnmount() {
    store.dispatch({ type: 'CLEAR_CONTEXT_MENU_ITEMS' })
    ComponentManager.cleanComponentReducerState(`${this.state.activeSubMenuItem}_GRID`)
  }

  onClick(contextMenuItemId) {
    store.dispatch({ type: 'CONTEXT_MENU_ITEM_WAS_CLICKED', payload: contextMenuItemId })
    this.setState({ isActive: !this.state.isActive })
  }

  onSubMenuItemClick(subMenuItemId) {
    if (subMenuItemId !== this.state.activeSubMenuItem) {
      ComponentManager.cleanComponentReducerState(`${this.state.activeSubMenuItem}_GRID`)
      store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], this.state.activeSubMenuItem] })
    }
    store.dispatch({ type: 'SUB_MENU_ITEM_WAS_CLICKED', payload: subMenuItemId })
    this.setState({ activeSubMenuItem: subMenuItemId })
  }

  configureMenuItems() {
    const { contextMenuItem, generateGrid, generateForm, getSearchFormData } = this.props
    const { isActive } = this.state
    const { onClick, onSubMenuItemClick, context } = this
    let button

    if (contextMenuItem) {
      if (contextMenuItem.route) {
        button = <Link key={contextMenuItem.id} to={contextMenuItem.route}>
          <button className='context-menu-btn-margin' id={`${contextMenuItem.id}_route`}>{menuIconsManager.getIcon(contextMenuItem.icon)}
            {context.intl.formatMessage({ id: `${contextMenuItem.labelCode}`, defaultMessage: `${contextMenuItem.labelCode}` })}
          </button>
        </Link>
      }

      if (contextMenuItem.type === 'grid') {
        button = <button
          className='context-menu-btn-margin'
          id={`${contextMenuItem.id}_btn`}
          key={contextMenuItem.id}
          onClick={() => {
            onClick(contextMenuItem.id)
            generateGrid(contextMenuItem, contextMenuItem.id)
          }}
        >{menuIconsManager.getIcon(contextMenuItem.icon)}
          {context.intl.formatMessage({
            id: contextMenuItem.labelCode,
            defaultMessage: contextMenuItem.labelCode
          })}
        </button>
      } else if (contextMenuItem.type === 'form') {
        button = <button
          className='context-menu-btn-margin'
          id={`${contextMenuItem.id}_btn`}
          key={contextMenuItem.id}
          onClick={() => {
            onClick(contextMenuItem.id)
            generateForm(contextMenuItem, contextMenuItem.id)
          }}
        >{menuIconsManager.getIcon(contextMenuItem.icon)}
          {context.intl.formatMessage({
            id: contextMenuItem.labelCode,
            defaultMessage: contextMenuItem.labelCode
          })}
        </button>
      } else if (contextMenuItem.type === 'editable_grid_with_form') {
        button = <button
          className='context-menu-btn-margin'
          id={`${contextMenuItem.id}_btn`}
          key={contextMenuItem.id}
          onClick={() => {
            onClick(contextMenuItem.id)
            generateGrid(contextMenuItem, contextMenuItem.id, 'editable-grid')
          }}
        >{menuIconsManager.getIcon(contextMenuItem.icon)}
          {context.intl.formatMessage({
            id: contextMenuItem.labelCode,
            defaultMessage: contextMenuItem.labelCode
          })}
        </button>
      } else if (contextMenuItem.type === 'custom_grid') {
        button = <button
          className='context-menu-btn-margin'
          id={`${contextMenuItem.id}_btn`}
          key={contextMenuItem.id}
          onClick={() => {
            onClick(contextMenuItem.id)
            generateGrid(contextMenuItem, contextMenuItem.id, 'custom_grid')
          }}
        >{menuIconsManager.getIcon(contextMenuItem.icon)}
          {context.intl.formatMessage({
            id: contextMenuItem.labelCode,
            defaultMessage: contextMenuItem.labelCode
          })}
        </button>
      } else if (contextMenuItem.type === 'search') {
        button = <button
          className='context-menu-btn-margin'
          id={`${contextMenuItem.id}_btn`}
          key={contextMenuItem.id}
          onClick={() => {
            onClick(contextMenuItem.id)
            getSearchFormData(contextMenuItem, contextMenuItem.id)
          }}
        >{menuIconsManager.getIcon(contextMenuItem.icon)}
          {context.intl.formatMessage({
            id: contextMenuItem.labelCode,
            defaultMessage: contextMenuItem.labelCode
          })}
        </button>
      }

      if (contextMenuItem.objectConfiguration) {
        if (contextMenuItem.objectConfiguration.type === 'grid') {
          button = <button
            className='context-menu-btn-margin'
            id={`${contextMenuItem.id}_btn`}
            key={contextMenuItem.id}
            onClick={() => generateGrid(contextMenuItem.objectConfiguration, contextMenuItem.id)}
          >{menuIconsManager.getIcon(contextMenuItem.icon)}
            {context.intl.formatMessage({
              id: contextMenuItem.labelCode,
              defaultMessage: contextMenuItem.labelCode
            })}
          </button>
        } else if (contextMenuItem.objectConfiguration.type === 'form') {
          button = <button
            className='context-menu-btn-margin'
            id={`${contextMenuItem.id}_btn`}
            key={contextMenuItem.id}
            onClick={() => generateForm(contextMenuItem.objectConfiguration, contextMenuItem.id)}
          >{menuIconsManager.getIcon(contextMenuItem.icon)}
            {context.intl.formatMessage({
              id: contextMenuItem.labelCode,
              defaultMessage: contextMenuItem.labelCode
            })}
          </button>
        } else if (contextMenuItem.objectConfiguration.type === 'search') {
          button = <button
            className='context-menu-btn-margin'
            id={`${contextMenuItem.id}_btn`}
            key={contextMenuItem.id}
            onClick={() => getSearchFormData(contextMenuItem, contextMenuItem.id)}
          >{menuIconsManager.getIcon(contextMenuItem.icon)}
            {context.intl.formatMessage({
              id: contextMenuItem.labelCode,
              defaultMessage: contextMenuItem.labelCode
            })}
          </button>
        }
      }

      if (contextMenuItem['sub-menu']) {
        button = <React.Fragment key={contextMenuItem.id}>
          <button
            className='context-menu-btn-margin'
            id={`${contextMenuItem.id}_btn`}
            key={contextMenuItem.id}
            onClick={() => onClick(contextMenuItem.id)}
          >{menuIconsManager.getIcon(contextMenuItem.icon)}
            {context.intl.formatMessage({
              id: contextMenuItem.labelCode,
              defaultMessage: contextMenuItem.labelCode
            })}
            <div className='context-menu-arrow-icon'>
              {iconManager.getIcon('arrowDown')}
            </div>
          </button>
          <div className='context-menu-flex-column-for-vertical-sub-menu'>
            {isActive && contextMenuItem['sub-menu'] && contextMenuItem['sub-menu'].map(subMenuItem => {
              if (subMenuItem.type === 'grid') {
                return <button
                  className={`context-menu-sub-menu-vertical context-menu-sub-menu-button ${isActive && 'context-menu-fade-in'}`}
                  id={subMenuItem.id}
                  key={subMenuItem.id}
                  onClick={() => {
                    onSubMenuItemClick(subMenuItem.id)
                    generateGrid(subMenuItem, subMenuItem.id, '')
                  }}
                >
                  {context.intl.formatMessage({
                    id: subMenuItem.labelCode,
                    defaultMessage: subMenuItem.labelCode
                  })}
                </button>
              } else if (subMenuItem.type === 'editable_grid_with_form') {
                return <button
                  className={`context-menu-sub-menu-vertical context-menu-sub-menu-button ${isActive && 'context-menu-fade-in'}`}
                  id={subMenuItem.id}
                  key={subMenuItem.id}
                  onClick={() => {
                    onSubMenuItemClick(subMenuItem.id)
                    generateGrid(subMenuItem, subMenuItem.id, 'editable-grid')
                  }}
                >
                  {context.intl.formatMessage({
                    id: subMenuItem.labelCode,
                    defaultMessage: subMenuItem.labelCode
                  })}
                </button>
              } else if (subMenuItem.type === 'custom_grid') {
                return <button
                  className={`context-menu-sub-menu-vertical context-menu-sub-menu-button ${isActive && 'context-menu-fade-in'}`}
                  id={subMenuItem.id}
                  key={subMenuItem.id}
                  onClick={() => {
                    onSubMenuItemClick(subMenuItem.id)
                    generateGrid(subMenuItem, subMenuItem.id, 'custom_grid')
                  }}
                >
                  {context.intl.formatMessage({
                    id: subMenuItem.labelCode,
                    defaultMessage: subMenuItem.labelCode
                  })}
                </button>
              } else if (subMenuItem.type === 'form') {
                return <button
                  className={`context-menu-sub-menu-vertical context-menu-sub-menu-button ${isActive && 'context-menu-fade-in'}`}
                  id={subMenuItem.id}
                  key={subMenuItem.id}
                  onClick={() => {
                    onSubMenuItemClick(subMenuItem.id)
                    generateForm(subMenuItem, subMenuItem.id)
                  }}
                >
                  {context.intl.formatMessage({
                    id: subMenuItem.labelCode,
                    defaultMessage: subMenuItem.labelCode
                  })}
                </button>
              } else if (subMenuItem.type === 'search') {
                return <button
                  className={`context-menu-sub-menu-vertical context-menu-sub-menu-button ${isActive && 'context-menu-fade-in'}`}
                  id={subMenuItem.id}
                  key={subMenuItem.id}
                  onClick={() => {
                    onSubMenuItemClick(subMenuItem.id)
                    getSearchFormData(subMenuItem, subMenuItem.id)
                  }}
                >
                  {context.intl.formatMessage({
                    id: subMenuItem.labelCode,
                    defaultMessage: subMenuItem.labelCode
                  })}
                </button>
              }
            })}
          </div>
        </React.Fragment>
      }
    }

    return button
  }

  render() {
    return <div id={this.props.itemId}>{this.configureMenuItems()}</div>
  }
}

ContextMenuItem.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  clickedContextMenuItemId: state.contextMenuItemsReducer.clickedContextMenuItemId,
  clickedSubMenuItemId: state.contextMenuItemsReducer.clickedSubMenuItemId
})

export default connect(mapStateToProps)(ContextMenuItem)
