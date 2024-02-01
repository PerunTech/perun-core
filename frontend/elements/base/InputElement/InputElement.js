import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import ReactTooltip from 'react-tooltip'

/* custom form for handling errors f.r */

const InputElement = ({
  id,
  name,
  value,
  placeholder,
  className,
  error,
  type,
  onChange,
  onBlur,
  onKeyDown,
  onKeyUp,
  dataTip,
  disabled,
  maxlength,
  style

  // add context for label connection with redux store
}, context) => {
  /* replace placeholder text with error message
    change class for input field f.r.p.mkd*
  */
  dataTip = ''
  if (error !== undefined) {
    // placeholder = error;
    className += ' input_error'
    dataTip = error.toString()
  }

  return (

    <div className={classnames('form-group ', { 'has-error': error })}>
      {/* if no errors in dataTip return nothing, otherwise format labels from redux store */}
      <input
        data-tip={dataTip !== '' ? context.intl.formatMessage({ id: [dataTip], defaultMessage: [dataTip] }) : ''}
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        className={`form-control ${className}`}
        type={type}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        data-delay-hide='1000'
        data-event='mouseover'
        data-event-off='mouseout'
        data-class='tooltips'
        data-type='error'
        data-place='right'
        data-effect='solid'
        data-for={id}
        disabled={disabled}
        maxLength={maxlength}
        style={style}
      />
      <ReactTooltip event='click focus' globalEventOff='keypress' offset={{ left: 45, top: 8 }} id={id} />
    </div>)
}

export default InputElement

InputElement.contextTypes = {
  intl: PropTypes.object.isRequired
}
