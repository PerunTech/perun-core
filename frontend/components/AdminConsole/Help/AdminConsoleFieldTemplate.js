import React from 'react'
import PropTypes from 'prop-types'
import { Icon, ReactBootstrap } from '../../../elements'
import AdminConsoleContext from './AdminConsoleContext'

const { useState, useRef, useContext } = React
const { Overlay, Popover } = ReactBootstrap

const AdminConsoleFieldTemplate = ({
  id,
  label,
  required,
  children,
  errors,
  help,
  description,
  hidden,
  displayLabel,
  uiSchema,
  classNames,
  style,
  disabled,
  readonly,
  schema,
  registry,
  onDropPropertyClick,
  onKeyChange
}, context) => {
  const [showHelp, setShowHelp] = useState(false)
  const btnRef = useRef(null)
  const { sectionId } = useContext(AdminConsoleContext)

  if (hidden) {
    return <div style={{ display: 'none' }}>{children}</div>
  }
  const fieldName = id ? id.split('_').pop().toLowerCase() : null
  const labelCode = sectionId && fieldName ? `perun.admin_console.${sectionId}.form.${fieldName}.help` : null
  const helpText = labelCode ? context.intl.formatMessage({ id: labelCode, defaultMessage: '' }) : null

  const WrapIfAdditionalTemplate = registry?.templates?.WrapIfAdditionalTemplate

  const labelRow = displayLabel && label && (
    <div className='admin-console-field-label-row'>
      <label className='control-label' htmlFor={id}>
        {label}
        {required && <span className='required'>{'*'}</span>}
      </label>
      {helpText && (
        <>
          <button
            ref={btnRef}
            type='button'
            className={`admin-console-field-help-btn${showHelp ? ' admin-console-field-help-btn--active' : ''}`}
            onClick={() => setShowHelp(v => !v)}
          >
            <Icon name={showHelp ? 'IconHelpCircleFilled' : 'IconHelpCircle'} size={16} stroke={1.5} />
          </button>
          <Overlay
            target={btnRef.current}
            show={showHelp}
            placement='right'
            rootClose
            onHide={() => setShowHelp(false)}
          >
            {overlayProps => (
              <Popover {...overlayProps} className='admin-console-field-help-popover'>
                <Popover.Body>{helpText}</Popover.Body>
              </Popover>
            )}
          </Overlay>
        </>
      )}
    </div>
  )

  if (WrapIfAdditionalTemplate) {
    return (
      <WrapIfAdditionalTemplate
        classNames={classNames}
        style={style}
        disabled={disabled}
        id={id}
        label={label}
        onDropPropertyClick={onDropPropertyClick}
        onKeyChange={onKeyChange}
        readonly={readonly}
        required={required}
        schema={schema}
        uiSchema={uiSchema}
        registry={registry}
      >
        {labelRow}
        {displayLabel && description}
        {children}
        {errors}
        {help}
      </WrapIfAdditionalTemplate>
    )
  }

  return (
    <div className={classNames} style={style}>
      {labelRow}
      {displayLabel && description}
      {children}
      {errors}
      {help}
    </div>
  )
}

AdminConsoleFieldTemplate.contextTypes = {
  intl: PropTypes.object.isRequired
}

AdminConsoleFieldTemplate.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node,
  errors: PropTypes.node,
  help: PropTypes.node,
  description: PropTypes.node,
  hidden: PropTypes.bool,
  displayLabel: PropTypes.bool,
  uiSchema: PropTypes.object,
  classNames: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  schema: PropTypes.object,
  registry: PropTypes.object,
  onDropPropertyClick: PropTypes.func,
  onKeyChange: PropTypes.func
}

export default AdminConsoleFieldTemplate
