import React from 'react'
import { connect } from 'react-redux'

/**
* OPTIONAL PARAMETERS
* @param {function} submitAction - function that is executed on submitModalButton (ex: true/false show-hide Modal)
* @param {function} closeAction - function that is executed on closeModalButton (ex: true/false show-hide Modal)
* @param {function} onMouseEnterFunction - function that is executed on on mouse enter
* @param {any} customHeaderContent - custom header content can be string or render for other component
* @param {any} modalContent - modal content can be string or render for other component
* @param {string} modalTitle - modal title
* @param {string} nameSubmitBtn - name of the submit button
* @param {string} nameCloseBtn - name of the close button
* @param {string} modalSize - size of the modal from 40 (min string value) to 90 (max string value, also this is the default)
* @param {string} classBody - new class modalBody that has no padding
* @param {string} customClassBtnModal - class of the custom close button for modal 
* @param {boolean} noFooter - bool value to true if the user wants action to the corresponding name of the prop
* @param {boolean} noTopPadding - bool value to true if the user wants action to the corresponding name of the prop
**/

class Modal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      submitAction: '',
      showSubmitBtn: false,
      closeAction: '',
      showCloseBtn: false,
    }
  }

  /* check for submit action to generate secound button f.r, check for close action and generate cancel button AS :D */
  componentDidMount = () => {
    if (this.props.submitAction) {
      this.setState({ submitAction: this.props.submitAction, showSubmitBtn: true })
    }
    if (this.props.closeAction) {
      this.setState({ closeAction: this.props.closeAction, showCloseBtn: true })
    }
    if (this.props.modalSize) {
      this.setState({ modalSize: this.props.modalSize })
    } else {
      this.setState({ modalSize: '90' })
    }
    if (this.props.onMouseEnterFunction) {
      this.setState({ onMouseEnterFunction: this.props.onMouseEnterFunction })
    }
    if (this.props.classBody) {
      this.setState({ classBodyState: this.props.classBody })
    } else {
      this.setState({ classBodyState: 'modal-body' })
    }
    if (this.props.customClassBtnModal) {
      this.setState({ customClassBtnModal: this.props.customClassBtnModal })
    } else {
      this.setState({ customClassBtnModal: 'modal-button button-closeModal' })
    }
    if (this.props.noFooter) {
      this.setState({ removeFooterHeight: 'no-modal-footer' })
    }
    if (this.props.noTopPadding) {
      this.setState({ removeTopPadding: 'no-modal-padding' })
    }
    // Close the modal when the ESC key is pressed
    document.addEventListener('keydown', this.closeModalByEscapeKey)
  }

  componentWillUnmount() {
    // Remove the event listeners when the component unmounts
    document.removeEventListener('keydown', this.closeModalByEscapeKey)
  }

  closeModalByEscapeKey = e => {
    // 27 is the keyCode for the ESC key
    if (e.keyCode === 27 && (!this.props.secondaryModalIsActive || this.props.forceCloseOnEsc)) {
      this.closeModal()
    }
  }

  closeModal = () => {
    this.props.closeModal()
  }

  render() {
    const { customHeaderContent } = this.props
    const { submitAction, showSubmitBtn, closeAction, showCloseBtn, modalSize, onMouseEnterFunction, classBodyState, customClassBtnModal, removeFooterHeight, removeTopPadding } = this.state
    return (
      <React.Fragment>
        <div className={`modal-bg ${removeTopPadding}`}>
          <div style={{ width: `${modalSize}%` }} className='modal-wrapper modalPopup'>
            <div className='modal-header'>
              <h3 className='modal-title'>{this.props.modalTitle}</h3>
              {customHeaderContent && <React.Fragment>{customHeaderContent}</React.Fragment>}
              <span className='close-modal-btn' onClick={this.closeModal}>&#215;</span>
            </div>
            <div className={classBodyState} onMouseEnter={onMouseEnterFunction ? onMouseEnterFunction : null}>{this.props.modalContent}</div>
            <div className={`modal-footer ${removeFooterHeight}`}>
              {/* {showCloseBtn && <button onClick={closeAction} className={customClassBtnModal}>{this.props.nameCloseBtn}</button>} */}
              {showSubmitBtn && <button onClick={submitAction} className='modal-button button-submitModal'>{this.props.nameSubmitBtn}</button>}
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  secondaryModalIsActive: state.modal.secondaryModalIsActive
})

export default connect(mapStateToProps)(Modal)
