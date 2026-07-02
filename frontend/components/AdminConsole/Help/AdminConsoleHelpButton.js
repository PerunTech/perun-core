import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { ReactBootstrap, Icon } from '../../../elements'
import { fetchLabelText } from './adminConsoleHelpConfig'
import AdminConsoleContext from './AdminConsoleContext'

const { useState, useEffect, useContext } = React
const { Modal } = ReactBootstrap

const AdminConsoleHelpButton = ({ title, formLevel, onToggle, active }, context) => {
  const { sectionId } = useContext(AdminConsoleContext)
  const [show, setShow] = useState(false)
  const [apiText, setApiText] = useState('')
  const svSession = useSelector(state => state.security.svSession)

  const labelCode = sectionId ? `perun.admin_console.${sectionId}.${formLevel ? 'form.' : ''}help` : null

  useEffect(() => {
    if (labelCode && svSession) {
      fetchLabelText(`${labelCode}_l`, svSession).then(setApiText)
    }
  }, [labelCode, svSession])

  const shortText = labelCode ? context.intl.formatMessage({ id: labelCode, defaultMessage: '' }) : ''
  const helpText = apiText || shortText
  if (!helpText) return null

  const titleText = context.intl.formatMessage(title)
  const handleClick = onToggle || (() => setShow(true))
  const isActive = onToggle ? active : show

  return (
    <>
      <button
        className={`admin-console-help-btn${isActive ? ' admin-console-help-btn--active' : ''}`}
        onClick={handleClick}
      >
        <Icon name={isActive ? 'IconHelpCircleFilled' : 'IconHelpCircle'} size={32} stroke={1.5} />
      </button>
      {!onToggle && (
        <Modal className='admin-console-help-modal' show={show} onHide={() => setShow(false)}>
          <Modal.Header className='admin-console-help-modal-header' closeButton>
            <Modal.Title>{titleText}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='admin-console-help-modal-body'>
            <div className='help-modal-icon'>
              <Icon name='IconInfoCircle' size={26} stroke={1.5} />
            </div>
            <p>{helpText}</p>
          </Modal.Body>
        </Modal>
      )}
    </>
  )
}

AdminConsoleHelpButton.contextTypes = {
  intl: PropTypes.object.isRequired
}

AdminConsoleHelpButton.propTypes = {
  title: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string
  }).isRequired,
  formLevel: PropTypes.bool,
  onToggle: PropTypes.func,
  active: PropTypes.bool
}

export default AdminConsoleHelpButton
