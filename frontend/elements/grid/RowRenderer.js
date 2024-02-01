import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-data-grid';

export const customRowRenderer = (rowIdx) => {
  class RowRenderer extends React.Component {
    static propTypes = {
      idx: PropTypes.string.isRequired
    }

    setScrollLeft = (scrollBy) => {
      // if you want freeze columns to work, you need to make sure you implement this as apass through
      this.row.setScrollLeft(scrollBy)
    }

    getRowClassName = () => {
      let rowClassName = ''

      if (this.props.idx === rowIdx) {
        rowClassName += ' react-grid-Row-selected'
      }

      if (this.props.row.additionalClassName) {
        rowClassName += ` ${this.props.row.additionalClassName}`
      }

      return rowClassName
    }

    render() {
      // here we are just changing the style
      // but we could replace this with anything we liked, cards, images, etc
      // usually though it will just be a matter of wrapping a div, and then calling back through to the grid
      return (<div className={this.getRowClassName()}><Row ref={node => this.row = node} {...this.props} /></div>) // eslint-disable-line
    }
  }
  return RowRenderer
}
