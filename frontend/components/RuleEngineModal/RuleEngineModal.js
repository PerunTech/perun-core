import React from 'react'
import modalStyles from './RuleEngineModalStyles.module.css'
import PropTypes from 'prop-types'
const getRuleEngineTransition = (result) => {
  let transitionResult
  try {
    const titleObject = result.result
    const title = titleObject.TransitionMessage
    const status = titleObject.TransitionStatus
    let imgSrc
    if (status) {
      imgSrc = '/perun-assets/img/rule_engine_modal_icons/alertIcons/ok_large.png'
    } else imgSrc = '/perun-assets/img/rule_engine_modal_icons/alertIcons/error_large.png'
    transitionResult = <span>
      <img src={imgSrc} alt='title_img' width='50px' />
      <span>{title}</span>
    </span>
  } catch (error) {
    console.warn(error)
  }
  return transitionResult
}

const getRuleEngineActions = (result) => {
  let actionResults = []
  try {
    const actionsArray = result.actions_executed
    const subTitleObject = result.result
    const subTitle = subTitleObject.RuleLabel
    const subStatus = subTitleObject.RuleStatus
    let text
    if (subStatus) {
      text = `${props.context.intl.formatMessage({ id: `${config.labelBasePath}.main.forms.successfully`, defaultMessage: `${config.labelBasePath}.main.forms.successfully` })}`
    } else {
      text = `${props.context.intl.formatMessage({ id: `${config.labelBasePath}.main.forms.unsuccessfully`, defaultMessage: `${config.labelBasePath}.main.forms.unsuccessfully` })}`
    }
    actionResults.push(<div id='ruleInfoSubtitle' key='ruleInfoSubtitle' className={modalStyles['sub-title']}>{`${text} ${subTitle}`}</div>)
    if (actionsArray.constructor === Array && actionsArray.length > 0) {
      for (let i = 0; i < actionsArray.length; i++) {
        let element = actionsArray[i]
        let actionStatus = element.actionStatus
        let imgSrc
        if (actionStatus) {
          imgSrc = '/perun-assets/img/rule_engine_modal_icons/alertIcons/ok_small.png'
        } else {
          imgSrc = '/perun-assets/img/rule_engine_modal_icons/alertIcons/error_small.png'
        }
        const actionResult = <div id={`element_${i}`} key={`element_${i}`} className={modalStyles['single-result']}>
          <img src={imgSrc} alt='img_res' />
          <span>{element.typeActionDesc}</span>
          <div id={`element_${i}_msg`} className={modalStyles['single-result-info']}>{element.actionMessage}</div>
        </div>
        actionResults.push(actionResult)
      }
    }
  } catch (error) {
    console.warn(error)
  }
  return actionResults
}

const RuleEngineModal = (props) => {
  return (
    <div id='ruleInfoModal' className='modal' style={{ display: 'block', 'zIndex': '8000' }}>
      <div id='ruleInfoModalContent' className={`modal-content ${modalStyles['rule-engine-content']}`}>
        <div id='ruleInfoModalHeader' className={`modal-header ${modalStyles['rule-engine-header']}`}>
          <h4 id='ruleInfoModalTitle' className={`modal-title ${modalStyles['rule-engine-title']}`}>
            {getRuleEngineTransition(props.result)}
          </h4>
          <button id='ruleInfoClose' type='button' className='close' onClick={props.closeModal} data-dismiss='modal'>&times;</button>
        </div>
        <div id='ruleInfoModalBody' className={`modal-body ${modalStyles['rule-engine-body']}`}>
          {getRuleEngineActions(props.result)}
        </div>
        {/* <div id='ruleInfoModalFooter' className={`modal-footer ${modalStyles['rule-engine-footer']}`}> */}
        {/* </div> */}
        <div className='modal-footer' style={{ backgroundColor: '#f9f9f9' }}>
          <button id='ruleInfoCloseBtn' type='button' className={`btn btn_close_form ${modalStyles['rule-info-close-btn']}`} onClick={props.closeModal} data-dismiss='modal'>
            {props.context.intl.formatMessage({ id: `${config.labelBasePath}.main.forms.close`, defaultMessage: `${config.labelBasePath}.main.forms.close` })}
          </button>
        </div>
      </div>
    </div>
  )
}


RuleEngineModal.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default RuleEngineModal
