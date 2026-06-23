import React from 'react'

const InvertedMandatoryCheckbox = ({ id, label, value, onChange, disabled }) => {
  const isChecked = value === false || value === 'no' || value === 0
  return (
    <div className='checkbox'>
      <label htmlFor={id}>
        <input
          id={id}
          name={id}
          type='checkbox'
          checked={isChecked}
          onChange={e => onChange(!e.target.checked)}
          disabled={disabled}
        />
        <span>{label}</span>
      </label>
    </div>
  )
}

export default InvertedMandatoryCheckbox
