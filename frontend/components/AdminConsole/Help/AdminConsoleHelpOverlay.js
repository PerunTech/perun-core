import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Icon } from '../../../elements'
import { fetchLabelText } from './adminConsoleHelpConfig'
import AdminConsoleContext from './AdminConsoleContext'

const { useState, useEffect, useContext } = React

const AdminConsoleHelpOverlay = (_props, context) => {
  const [show, setShow] = useState(false)
  const { sectionId } = useContext(AdminConsoleContext)
  const [apiText, setApiText] = useState('')
  const svSession = useSelector(state => state.security.svSession)

  const labelCode = sectionId ? `perun.admin_console.${sectionId}.form.help` : null

  useEffect(() => {
    if (labelCode && svSession) {
      fetchLabelText(`${labelCode}_l`, svSession).then(setApiText)
    }
  }, [labelCode, svSession])

  const shortText = labelCode ? context.intl.formatMessage({ id: labelCode, defaultMessage: '' }) : ''
  const helpText = apiText || shortText
  if (!helpText) return null

  return (
    <>
      {!show && (
        <button
          type='button'
          className='admin-console-help-btn admin-console-form-help-trigger'
          onClick={() => setShow(true)}
        >
          <Icon name='IconHelpCircle' size={24} stroke={1.5} />
        </button>
      )}
      <div className={`admin-console-form-help-overlay${show ? ' admin-console-form-help-overlay--visible' : ''}`}>
        <div className='admin-console-form-help-overlay-header'>
          <Icon name='IconInfoCircle' size={26} stroke={1.5} />
          <button
            type='button'
            className='btn-close'
            aria-label='Close'
            onClick={() => setShow(false)}
          />
        </div>
        <p>{helpText}</p>
      </div>
    </>
  )
}

AdminConsoleHelpOverlay.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default AdminConsoleHelpOverlay
