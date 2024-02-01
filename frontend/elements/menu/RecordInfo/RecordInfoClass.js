import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import createHashHistory from 'history/createHashHistory';
import { labelBasePath } from '../../../config';
import { store } from '../../../model';
import style from './RecordInfo.module.css';

const hashHistory = createHashHistory()

class RecordInfoClass extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pharagraphItemTitle: undefined
    }
  }

  componentDidMount () {
    // start functions
    this.loadFunctions(this.props)
  }

  componentWillReceiveProps (nextProps) {
    // start functions when data is changed (form is saved)
    if (this.props.gridConfig !== nextProps.gridConfig) {
      this.loadFunctions(nextProps)
    }
  }

  loadFunctions = (props) => {
    this.setState(
      // first argument, function that returns an object
      this.currentRowToState(props),
      // second argument, setState callback
      () => {
        this.iterateConfig(
          this.state,
          props,
          this.translateCodes(
            this.createParagraphItems
          )
        )
      }
    )
  }

  // check if integer is a natural number
  isNatural = (n) => {
    if (typeof n !== 'number') {
      return false
    }
    return (n >= 0.0) && (Math.floor(n) === n) && n !== Infinity
  }
  // set selected row to state
  currentRowToState = (props) => {
    if (props && props.componentStack && props.componentStack.length) {
      const currentSelectedRowIndex = props.componentStack.length - 1
      const currentSelectedRow = this.isNatural(currentSelectedRowIndex) && props.componentStack[currentSelectedRowIndex]

      return {...currentSelectedRow.row, gridType: props.gridType}
    }
  }
  // iterate configuration prop
  iterateConfig = (state, props, callback) => {
    this.props.configuration(props.gridType, this.context.intl) &&
    props.configuration(props.gridType, this.context.intl).CHOSEN_ITEM &&
    props.configuration(props.gridType, this.context.intl).CHOSEN_ITEM.map(
      element => {
        if (callback instanceof Function) {
          callback(state, props, element)
        }
      }
    )
  }
  // translate codes from WS, see recordConfig.js
  translateCodes = (callback) => (state, props, element) => {
    if (element.ITEM_FUNC) {
      store.dispatch(element.ITEM_FUNC(
        // first argument is an object so we can use different functions from config file
        // the given function can use any of the data in the object
        {
          props,
          state,
          element,
          callback: (response) => {
            this.setState(
              {[`${props.gridType}.${element.ID}`]: response},
              () => {
                if (callback instanceof Function) {
                  callback(this.state, props, element)
                }
              }
            )
          }
        }
      ))
    } else {
      if (callback instanceof Function) {
        // state ass callback not this.state
        callback(state, props, element)
      }
    }
  }
  // create pharagraph items and set to state
  createParagraphItems = (state, props, element) => {
    const pharagraphItemTitle = [<p style={{margin: '0'}} key={'record_info_' + props.gridType + 'title'} >{props.gridType}</p>]
    let pharagraphItem
    let style = {margin: '0'}
    let click
    const value = state[`${props.gridType}.${element.ID}`]

    if (element.LINK_TO_TABLE) {
      style = {
        margin: '0',
        color: '#c8990e',
        cursor: 'pointer'
      }
      click = () => hashHistory.push(
        `/main/dynamic/${element.LINK_TO_TABLE.toLowerCase()}?c=${element.LINK_TO_PARRENT_BY}&v=${value}`
      )
      pharagraphItem = (value && <p onClick={click}
        style={style}
        key={'record_info_' + props.gridType + element.ID}
      >
        {`${element.LABEL}: ${value}`}
      </p>)
    } else {
      pharagraphItem = (value && <p onClick={click}
        style={style}
        key={'record_info_' + props.gridType + element.ID}
      >
        {`${element.LABEL}: ${value}`}
      </p>)
    }

    this.setState({pharagraphItemTitle, [element.ID]: pharagraphItem})
  }
  // render phararaph items
  renderParagraphItems = (state, props) => props.configuration(props.gridType, this.context.intl) &&
    props.configuration(props.gridType, this.context.intl).CHOSEN_ITEM &&
    props.configuration(props.gridType, this.context.intl).CHOSEN_ITEM.map(
      element => {
        return state[element.ID]
      }
    )

  render () {
    return (
      <div id='record_info' className={style.divMainContent}>
        <div id='selected_item' className={style.selected_item}>
          {this.state.pharagraphItemTitle}
          {this.renderParagraphItems(this.state, this.props)}
          {`${this.context.intl.formatMessage({
            id: `${labelBasePath}.main.holding.holding_keeper`,
            defaultMessage: `${labelBasePath}.main.holding.holding_keeper`
          })}: ${this.props.additionalData.HOLDING_KEEPER}`}
        </div>
      </div>
    )
  }
}

RecordInfoClass.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return ({
    // this is used to trigger a rerender if props are changed (when saving a form)
    gridConfig: state.gridConfig,
    additionalData: state.additionalData
  })
}

export default connect(mapStateToProps)(RecordInfoClass)
