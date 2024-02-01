import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'
import { store } from '../../model';
import { iconManager } from '../../assets/svg/menuIcons'

class MenuRender extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isActive: false,
      gridState: false,
      formState: false
    }
    this.onClick = this.onClick.bind(this)
    this.renderFn = this.renderFn.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  onClick(id, buttonId) {
    this.setState({ isActive: !this.state.isActive })
    store.dispatch({ type: 'IS_CLEARED' })
    if (this.props.isClicked !== id) {
      store.dispatch({ type: 'IS_CLICKED', payload: id })
      if (buttonId) {
        store.dispatch({ type: 'SET_ACTIVE_MODULE_MENU_ITEM', payload: buttonId })
      }
    }
    let th1s = this
    th1s.props.clearClicked()
  }

  componentDidMount() {
    document.addEventListener('click', (e) => this.handleClose(e));
  }

  componentWillUnmount() {
    document.removeEventListener('click', (e) => this.handleClose(e));
  }

  handleClose(e) {
    if (this.node) {
      /* to be checked */
      if (!this.node.contains(e.target)) {
        this.setState({ isActive: false })
      }
    }
  }

  renderFn() {
    const { activeItem } = this.props
    const { isActive } = this.state
    const { onClick, context } = this
    return (
      <div ref={node => this.node = node} className='module-menu-parent'>
        <React.Fragment>
          {(function (param) {
            let btnClassNames = 'module-menu-btn-margin module-menu-btn-secondary'
            if (param.moduleMenu.id === activeItem) {
              btnClassNames += ` module-menu-btn-active`
            }
            let subMenuBtnClassNames = param.moduleMenu['sub-menu'] ? 'module-menu-btn-margin-arrow module-menu-btn-margin module-menu-btn-secondary' : 'module-menu-btn-margin module-menu-btn-secondary'
            if (param.moduleMenu.id === activeItem) {
              subMenuBtnClassNames += ` module-menu-btn-active`
            }
            if (param.moduleMenu['route']) { //if parent button is route
              return (
                <Link
                  id={param.moduleMenu.id}
                  key={param.moduleMenu.id}
                  to={param.moduleMenu['route']}
                  onClick={() => onClick(param.moduleMenu['route'], param.moduleMenu.id)}
                >
                  <button className={btnClassNames}>{iconManager.getIcon(param.moduleMenu.icon)}
                    {context.intl.formatMessage({ id: `${param.moduleMenu.labelCode}`, defaultMessage: `${param.moduleMenu.labelCode}` })}
                  </button>
                </Link>
              )
            }
            if (param.moduleMenu['contextMenuLabelCode']) {
              return <button
                className={btnClassNames}
                id={param.moduleMenu.id}
                key={param.moduleMenu.id}
                onClick={() => {
                  param.displayContextMenu(param.moduleMenu['contextMenuLabelCode'])
                  onClick(param.moduleMenu.id, param.moduleMenu.id)
                }}>{context.intl.formatMessage({ id: `${param.moduleMenu.labelCode}`, defaultMessage: `${param.moduleMenu.labelCode}` })}
              </button>
            }
            if (param.moduleMenu['objectConfiguration']) { //if parent button has objConf
              if (param.moduleMenu['objectConfiguration']['type'] === 'grid') { //check objConf type
                return <button
                  className={btnClassNames}
                  id={param.moduleMenu.id}
                  key={param.moduleMenu.id}
                  onClick={() => {
                    param.assigneGridBuildFunc(param.moduleMenu['objectConfiguration'], param.moduleMenu.id)
                    onClick(param.moduleMenu.id, param.moduleMenu.id)
                  }}>{iconManager.getIcon(param.moduleMenu.icon)}{context.intl.formatMessage({ id: `${param.moduleMenu.labelCode}`, defaultMessage: `${param.moduleMenu.labelCode}` })}
                </button>
              } else if (param.moduleMenu['objectConfiguration']['type'] === 'editable_grid_with_form') {
                return <button
                  id={param.moduleMenu.id}
                  key={param.moduleMenu.id}
                  className={btnClassNames}
                  onClick={() => { param.assigneGridBuildFunc(param.moduleMenu['objectConfiguration'], param.moduleMenu.tableName, 'editable-grid'); onClick(param.moduleMenu.id, param.moduleMenu.id) }}
                >{iconManager.getIcon(param.moduleMenu.icon)}{context.intl.formatMessage({ id: `${param.moduleMenu.labelCode}`, defaultMessage: `${param.moduleMenu.labelCode}` })}
                </button>
              } else if (param.moduleMenu['objectConfiguration']['type'] === 'form') { //check objConf type
                return <button
                  className={btnClassNames}
                  id={param.moduleMenu.id}
                  key={param.moduleMenu.id}
                  onClick={() => param.assigneFormBuildFunc(param.moduleMenu['objectConfiguration'], param.moduleMenu.id, '', '', param.moduleMenu.searchField)}>{iconManager.getIcon(param.moduleMenu.icon)}{context.intl.formatMessage({ id: `${param.moduleMenu.labelCode}`, defaultMessage: `${param.moduleMenu.labelCode}` })}
                </button>
              }
            }
            if (param.moduleMenu['type'] === 'search') { //if type is search then create search component
              return <button
                className={btnClassNames}
                onClick={() => { param.assignSearchFormFunc(param.moduleMenu, param.moduleMenu.id); onClick(param.moduleMenu.id, param.moduleMenu.id) }}
                key={param.moduleMenu.id}>{iconManager.getIcon(param.moduleMenu.icon)}{context.intl.formatMessage({ id: `${param.moduleMenu.labelCode}`, defaultMessage: `${param.moduleMenu.labelCode}` })}
              </button>
            }
            if (param.moduleMenu['sub-menu']) { // if there is child button
              return <React.Fragment>
                <button
                  className={subMenuBtnClassNames}
                  id={param.moduleMenu.id}
                  onClick={() => onClick(param.moduleMenu.id)}>{iconManager.getIcon(param.moduleMenu.icon)}
                  {context.intl.formatMessage({ id: `${param.moduleMenu.labelCode}`, defaultMessage: `${param.moduleMenu.labelCode}` })}
                </button>
                <div className='module-menu-flex-column-for-sub-menu'><ul>{param.moduleMenu['sub-menu'] && isActive === true && //if the child button is clicked
                  param.moduleMenu['sub-menu'].map((el, i) => (
                    (function () {
                      if (el['type'] == 'search') { // check child button conf Type                  
                        return <li><button
                          id={el['id']}
                          className='module-menu-sub-menu-horizontal module-menu-btn-secondary'
                          onClick={() => { param.assignSearchFormFunc(el, el['id']); onClick() }}
                          key={i}>{context.intl.formatMessage({ id: `${el.labelCode}`, defaultMessage: `${el.labelCode}` })}
                        </button>
                        </li>
                      } else if (el['type'] == 'grid') { // check child button conf Type
                        return <li><button
                          id={el['id']}
                          className='module-menu-sub-menu-horizontal module-menu-btn-secondary'
                          onClick={() => { param.assigneGridBuildFunc(el, el['id']); onClick() }}
                          key={i}>{context.intl.formatMessage({ id: `${el.labelCode}`, defaultMessage: `${el.labelCode}` })}
                        </button>
                        </li>
                      } else if (el['type'] == 'form') { // check child button conf Type
                        return <li><button
                          id={el['id']}
                          className='module-menu-sub-menu-horizontal module-menu-btn-secondary'
                          onClick={() => { param.assigneFormBuildFunc(el, el['id'], '', '', el['searchField']); onClick() }}
                          key={i}>{context.intl.formatMessage({ id: `${el.labelCode}`, defaultMessage: `${el.labelCode}` })}
                        </button>
                        </li>
                      } else if (el['type'] == 'editable_grid_with_form') { //check if child is editable grid
                        return <li> <button
                          id={el['id']}
                          className='module-menu-sub-menu-horizontal module-menu-btn-secondary'
                          onClick={() => { param.assigneGridBuildFunc(el, el['tableName'], 'editable-grid'); onClick() }}
                          key={i}>{context.intl.formatMessage({ id: `${el.labelCode}`, defaultMessage: `${el.labelCode}` })}
                        </button>
                        </li>
                      } else if (el['route']) {
                        return <Link to={el['route']} className='module-menu-sub-menu-horizontal'>
                          <li> <button id={el['id']} onClick={() => onClick(param.moduleMenu['route'], param.moduleMenu.id)} className='module-menu-sub-menu-btn-full-width module-menu-btn-secondary'>
                            {iconManager.getIcon(el.icon)}{context.intl.formatMessage({ id: `${el.labelCode}`, defaultMessage: `${el.labelCode}` })}
                          </button>
                          </li>
                        </Link>
                      } else { // return basic button if no conf Type
                        return <li><button
                          id={el['id']}
                          className='module-menu-sub-menu-horizontal module-menu-btn-secondary'
                          onClick={() => onClick(el['id'])}
                          key={i}>{iconManager.getIcon(el.icon)}{context.intl.formatMessage({ id: `${el.labelCode}`, defaultMessage: `${el.labelCode}` })}
                        </button>
                        </li>
                      }
                    })()
                  ))
                }</ul></div></React.Fragment>
            } else {
              return <button
                className={btnClassNames}
                onClick={() => onClick()}>{context.intl.formatMessage({ id: `${param.labelCode}`, defaultMessage: `${param.labelCode}` })}
              </button>
            }
          })(this.props)}
        </React.Fragment>
      </div>
    )
  }

  render() {
    return (
      <React.Fragment>
        <div className='module-menu-flex'>
          {this.renderFn()}
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
  isClicked: state.clickedMenuReducer.isClicked,
  activeItem: state.clickedMenuReducer.activeItem,
})

MenuRender.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(MenuRender)
