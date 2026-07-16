import React, { useEffect } from 'react';
import { ComponentManager } from '../..';

// Generic rjsf widget: value mirrors an attribute off whatever codelist row
// is currently selected on another field. The attribute looked up is this
// widget's own field name (see GenericForm's DependentValueField wrapper,
// which passes it as attributeName), so uiSchema only needs to declare
// `dependentOnField`, nothing else.
const DependentValueField = (props) => {
  const { id, label, formId, dependentOnField, attributeName, sourceValue, onChange, schema, value, disabled, readonly } = props

  useEffect(() => {
    const dataByField = ComponentManager.getStateForComponent(formId, 'dependentFieldData') || {}
    const row = dataByField[dependentOnField]?.[sourceValue]
    const derivedValue = row ? row[attributeName] : undefined
    // Skip when there's nothing to change: on a freshly-added array row,
    // sourceValue and value are both still empty, and firing onChange here
    // races with rjsf's own add-item onChange (ArrayField.onChangeForIndex
    // maps over its own formData prop, which doesn't include the new row
    // yet), silently dropping the row that was just added.
    if (derivedValue === value) return
    onChange(derivedValue)
    // Only resync when the source field's value actually changes, not on every
    // parent re-render (onChange's identity isn't stable across renders here).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceValue])

  const isDisabled = disabled || readonly
  if (schema?.type === 'boolean') {
    // Matches rjsf's own CheckboxWidget markup, so this renders identically to
    // a default boolean field (the outer form-group/field wrapper comes from
    // rjsf's field template, applied to any widget, not from here).
    return (
      <div className={`checkbox ${isDisabled ? 'disabled' : ''}`}>
        <label>
          <input
            type='checkbox'
            id={id}
            name={id}
            checked={!!value}
            disabled={isDisabled}
            aria-describedby={`${id}__error ${id}__description ${id}__help`}
          />
          <span>{label}</span>
        </label>
      </div>
    )
  }
  return <input id={id} type='text' className='form-control' value={value ?? ''} disabled={isDisabled} readOnly />
}

export default DependentValueField
