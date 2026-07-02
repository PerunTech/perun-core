import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Icon } from '../../../elements'
import { getHelpConfig, loadHelpConfig, fetchLabelText } from './adminConsoleHelpConfig'
import AdminConsoleContext from './AdminConsoleContext'

const { useState, useEffect, useContext } = React

const AdminConsoleHelpOverlay = ({ onClose, show }, context) => {
  const { sectionId } = useContext(AdminConsoleContext)
  const [config, setConfig] = useState(getHelpConfig)
  const [longHelpText, setLongHelpText] = useState('')
  const svSession = useSelector(state => state.security.svSession)

  const labelId = config?.[sectionId]?.form
  const isLong = labelId?.endsWith('_l')

  useEffect(() => {
    if (!config) {
      loadHelpConfig().then(() => setConfig(getHelpConfig()))
    }
  }, [])

  useEffect(() => {
    if (isLong && labelId && svSession) {
      fetchLabelText(labelId.replace(/_l$/, ''), svSession).then(setLongHelpText)
    }
  }, [isLong, labelId, svSession])

  if (!labelId) return null

  const helpText = isLong ? longHelpText : context.intl.formatMessage({ id: labelId, defaultMessage: '' })

  return (
    <div className={`admin-console-form-help-overlay${show ? ' admin-console-form-help-overlay--visible' : ''}`}>
      <div className='admin-console-form-help-overlay-header'>
        <Icon name='IconInfoCircle' size={26} stroke={1.5} />
        <button
          type='button'
          className='btn-close'
          aria-label='Close'
          onClick={onClose}
        />
      </div>
      <p>{helpText}</p>
    </div>
  )
}

AdminConsoleHelpOverlay.contextTypes = {
  intl: PropTypes.object.isRequired
}

AdminConsoleHelpOverlay.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool
}

export default AdminConsoleHelpOverlay
