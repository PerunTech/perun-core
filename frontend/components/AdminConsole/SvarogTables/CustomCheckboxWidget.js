import React from 'react'

const CustomCheckboxWidget = ({ id, value, onChange, label, disabled, readonly, options }) => (
  <>
    <label className='stp-toggle' htmlFor={id}>
      <input
        id={id}
        name={id}
        type='checkbox'
        checked={!!value}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled || readonly}
      />
      <span className='stp-toggle-track' />
    </label>
    <label className='stp-edit-toggle-label' htmlFor={id} style={options?.color ? { color: options.color } : undefined}>
      {label}
    </label>
  </>
)

export default CustomCheckboxWidget
