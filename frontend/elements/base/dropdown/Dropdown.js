import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';

const generateHtmlOptions = (options) => {
  const htmlOptions = options.map((element, index) => (<option
    id={element.id}
    key={element.id}
    name={element.name}
    value={element.value}
    selected={element.selected}
    disabled={element.disabled}
    hidden={element.hidden}
  >
    {element.text}
  </option>))
  return htmlOptions
}

export const Dropdown = ({
  id,
  name,
  value,
  placeholder,
  className,
  containerClassName,
  error,
  type,
  onChange,
  onBlur,
  onKeyDown,
  onKeyUp,
  dataTip,
  disabled,
  maxlength,
  style,
  options,
  labelText,
  required
}, context) => {
  dataTip = ''
  if (error !== undefined) {
    className += ' input_error'
    dataTip = error.toString()
  }
  let htmlOptions
  if (options) {
    htmlOptions = generateHtmlOptions(options)
  }
  return (
    <div className={classnames(`form-group ${containerClassName}`, { 'has-error': error })} style={style} >
      {
        labelText && <label className='control-label' htmlFor={id}>
          {labelText}
        </label>
      }
      <select
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
        required={required}
        maxLength={maxlength}
      >
        {htmlOptions}
      </select>
      <ReactTooltip event='click focus' globalEventOff='keypress' offset={{ left: 45, top: 8 }} id={id + '_tooltip'} />
    </div>
  )
}

Dropdown.contextTypes = {
  intl: PropTypes.object.isRequired
}
