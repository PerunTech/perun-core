import React from 'react';
import GenericForm from './GenericForm';
import { WrapItUp } from '..';

class StructuredForm extends React.Component {
  componentDidMount () {
    this.props.refFunction(this)
    this.updateClassForRenderedFields()
  }

  componentDidUpdate () {
    this.updateClassForRenderedFields()
  }

  /* A user can pass a parameter to this component through customElementClass,
in order to change the class or how the rendered html elements are displayed KNI 10.04.2017 */
  updateClassForRenderedFields () {
    const customElementClass = this.props.customElementClass
    if (customElementClass !== undefined && customElementClass !== null) {
      const elsInt = [].slice.apply(document.getElementsByClassName('form-group field field-integer'))
      for (let a = 0; a < elsInt.length; a++) {
        elsInt[a].className = elsInt[a].className.replace(/ *\bform-group field field-integer\b/g, customElementClass)
      }
      const elsStr = [].slice.apply(document.getElementsByClassName('form-group field field-string'))
      for (let b = 0; b < elsStr.length; b++) {
        if (elsStr[b].parentNode.parentNode.parentNode.className !== 'col-xs-9') {
          // above line (if- clause) excludes dynamic pairs of text boxes
          elsStr[b].className = elsStr[b].className.replace(/ *\bform-group field field-string\b/g, customElementClass)
        }
      }
      const elsNum = [].slice.apply(document.getElementsByClassName('form-group field field-number'))
      for (let c = 0; c < elsNum.length; c++) {
        elsNum[c].className = elsNum[c].className.replace(/ *\bform-group field field-number\b/g, customElementClass)
      }
      const elsBool = [].slice.apply(document.getElementsByClassName('form-group field field-boolean'))
      for (let d = 0; d < elsBool.length; d++) {
        elsBool[d].className = elsBool[d].className.replace(/ *\bform-group field field-boolean\b/g, customElementClass)
      }
      const elsError = [].slice.apply(document.getElementsByClassName('form-group field field-integer field-error has-error has-danger'))
      for (let e = 0; e < elsError.length; e++) {
        elsError[e].className = elsError[e].className.replace(/ *\bform-group field field-integer field-error has-error has-danger\b/g, customElementClass)
      }
    }

    const hiddenElements = [].slice.apply(document.getElementsByTagName('INPUT'))
    for (let d = 0; d < hiddenElements.length; d++) {
      if (hiddenElements[d].type === 'hidden') {
        hiddenElements[d].parentNode.removeChild(hiddenElements[d])
      }
    }

    const dropDownElements = [].slice.apply(document.getElementsByTagName('SELECT'))
    // TO DO: Add language labels for this...
    for (let s = 0; s < dropDownElements.length; s++) {
      if (dropDownElements[s].options[0].text === 'month') {
        dropDownElements[s].options[0].text = 'месец'
        const parent = dropDownElements[s].parentNode.parentNode
        parent.insertBefore(dropDownElements[s].parentNode, parent.childNodes[0])
      } else if (dropDownElements[s].options[0].text === 'day') {
        dropDownElements[s].options[0].text = 'ден'
        const parent = dropDownElements[s].parentNode.parentNode
        parent.insertBefore(dropDownElements[s].parentNode, parent.childNodes[0])
      } else if (dropDownElements[s].options[0].text === 'year') {
        dropDownElements[s].options[0].text = 'година'
      }
    }
  }

  render () {
    return (
      <GenericForm {...this.props} />)
  }
}

export default WrapItUp(StructuredForm, 'GenericForm', undefined, false)
