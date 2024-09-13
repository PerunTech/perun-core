import React from 'react';
import PropTypes from 'prop-types';
import { labelBasePath } from '../../config';
import { Toolbar } from 'react-data-grid-addons';
// This Class extends Toolbar class and adds a custom button
export default class CustomGridToolbar extends Toolbar {
  constructor(props) {
    super(props)
    this.state = {
      customButtonJsx: undefined,
      additionalButtonJsx: undefined
    }
  }

  componentDidMount() {
    this.customButtonJSX(this.props)
  }

  customButtonJSX = (props) => {
    if (props.customButton) {
      if (props.customButtonLabel) {
        let className = 'btn'
        if (props.customButtonClassName) {
          className += ` ${props.customButtonClassName}`
        }
        this.setState({
          customButtonJsx: <button
            onClick={props.customButton instanceof Function ? props.customButton : null}
            type='button'
            className={className}
            title={props.customButtonTitle}
          >
            {this.context.intl.formatMessage({
              id: props.customButtonLabel,
              defaultMessage: props.customButtonLabel
            })}
          </button>
        })
      } else {
        let className = 'btn'
        if (props.customButtonClassName) {
          className += ` ${props.customButtonClassName}`
        }
        this.setState({
          customButtonJsx: <button
            onClick={props.customButton instanceof Function ? props.customButton : null}
            type='button'
            className={className}
            title={props.customButtonTitle}
          >
            {
              this.props.hasLinkGridInModal
                ? this.context.intl.formatMessage({
                  id: `${labelBasePath}.main.grids.find_existing`,
                  defaultMessage: `${labelBasePath}.main.grids.find_existing`
                })
                : this.context.intl.formatMessage({
                  id: `${labelBasePath}.main.grids.add_simple`,
                  defaultMessage: `${labelBasePath}.main.grids.add_simple`
                })
            }
          </button>
        })
      }
    }


    if (props.additionalButton) {
      if (props.additionalButtonLabel) {
        this.setState({
          additionalButtonJsx: <button
            onClick={props.additionalButton instanceof Function ? props.additionalButton : null}
            type='button'
            className={`btn ${props.additionalButtonClassName}`}
          >
            {this.context.intl.formatMessage({
              id: props.additionalButtonLabel,
              defaultMessage: props.additionalButtonLabel
            })}
          </button>
        })
      } else {
        this.setState({
          additionalButtonJsx: <button
            onClick={props.additionalButton instanceof Function ? props.additionalButton : null}
            type='button'
            className={`btn ${props.additionalButtonClassName}`}
          >
            {
              this.props.hasLinkGridInModal
                ? this.context.intl.formatMessage({
                  id: `${labelBasePath}.main.grids.find_existing`,
                  defaultMessage: `${labelBasePath}.main.grids.find_existing`
                })
                : this.context.intl.formatMessage({
                  id: `${labelBasePath}.main.grids.add_simple`,
                  defaultMessage: `${labelBasePath}.main.grids.add_simple`
                })
            }
          </button>
        })
      }
    }

    if (props.buttonsArray) {
      let localBtnsArr = []
      for (let i = 0; i < props.buttonsArray.length; i++) {
        let element = props.buttonsArray[i]
        let btn = <button
          type='button'
          key={element.id}
          id={element.id}
          className={element.className ? `btn ${element.className}` : 'btn'}
          onClick={element.action instanceof Function ? element.action : null}>
          {element.name}
        </button>
        localBtnsArr.push(btn)
      }
      this.setState({ localBtnsArr })
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.customButton !== nextProps.customButton) {
      this.customButtonJSX(nextProps)
    }
    if (this.props.additionalButton !== nextProps.additionalButton) {
      this.customButtonJSX(nextProps)
    }
  }

  render() {
    return (
      <div className='react-grid-Toolbar'>
        {this.props.children}
        <div className='tools fadeIn'>
          {this.state.additionalButtonJsx}
          {this.state.customButtonJsx}
          {this.state.localBtnsArr}
          {this.renderAddRowButton()}
          {this.renderToggleFilterButton()}
        </div>
      </div>
    )
  }
}

CustomGridToolbar.contextTypes = {
  intl: PropTypes.object.isRequired
}
