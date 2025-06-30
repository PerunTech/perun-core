import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Tooltip } from 'react-tooltip';

export const Button = ({
  id,
  name,
  type,
  label,
  className,
  onClick,
  error,
  dataTip,
  disabled
}, context) => {
  dataTip = ''
  if (error !== undefined) {
    className += ' input_error'
    dataTip = error.toString()
  }

  return (
    <div className={classnames('form-group ', { 'has-error': error })}>
      <button
        data-tooltip-id={`${id}-tooltip`}
        data-tooltip-content={dataTip !== '' ? context.intl.formatMessage({ id: [dataTip], defaultMessage: [dataTip] }) : ''}
        id={id}
        key={id}
        name={name}
        type={type}
        className={`btn ${className}`}
        onClick={onClick}
        disabled={disabled}
      >{label}
      </button>
      <Tooltip event='click focus' globalEventOff='keypress' id={`${id}-tooltip`} />
    </div>
  )
}

Button.contextTypes = {
  intl: PropTypes.object.isRequired
}
