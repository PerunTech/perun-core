import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { store } from '../../../model'
import { svConfig } from '../../../config';
import { Dropdown, findWidget, $, ComponentManager } from '../..';
import { isValidArray, isValidObject } from '../../../functions/utils';

const right = {
  'display': 'inline-table'
}

const additionalStyle = {
  'display': 'inline-table',
  'marginLeft': '0.5rem'
}

const down = {
  'display': 'block'
}

// represents the internal dependency dropdown logic
class DependentElements extends React.Component {
  constructor(props) {
    super(props)
    const initialState = {
      initialDropdown: null,
      dynamicDropdowns: [],
      spread: this.props.spread || 'right'
    }
    this.state = initialState
    this.style = right
    this.additionalStyle = additionalStyle
    if (this.props.spread === 'down') {
      this.style = down
      this.additionalStyle = down
    }
  }

  componentDidMount() {
    const { formConfig, formSchema } = this.props
    const formData = Object.assign({}, this.props.formData)
    const sectionName = this.props.sectionName
    if (formData && formData.constructor === Object && Object.keys(formData).length > 0) {
      if (formData[sectionName]) {
        const subEls = Object.keys(formData[sectionName])
        for (let i = 0; i < subEls.length; i++) {
          if (subEls[i] === findWidget(this.props.formSchema, 'ui:widget', 'DependencyDropdown')) {
            this.fetchInitialCodelist(subEls[i], formData[sectionName][subEls[i]])
          } else if (findWidget(this.props.formSchema, 'dependentOn', subEls[i - 1])) {
            this.generateExisting(
              'root_' + sectionName + '_' + subEls[i - 1],
              formData[sectionName][subEls[i]],
              formData[sectionName][subEls[i - 1]]
            )
          }
        }
      } else {
        const formFields = Object.keys(formConfig.properties)
        const finalFormData = Object.assign({}, formData)
        // Append an empty string as the value of each field that doesn't have a value
        formFields.forEach(field => {
          if (!finalFormData[field]) {
            finalFormData[field] = ''
          }
        })
        const subEls = Object.keys(finalFormData)
        for (let i = 0; i < subEls.length; i++) {
          if (subEls[i] === findWidget(formSchema, 'ui:widget', 'DependencyDropdown')) {
            this.fetchInitialCodelist(subEls[i], formData[subEls[i]])
          } else if (formSchema?.[subEls[i]]?.dependentOnField) {
            const parentElement = formSchema?.[subEls[i]]?.dependentOnField
            const elementOrder = formSchema[parentElement]?.order
            if (formSchema[subEls[i]]?.order === elementOrder + 1) {
              this.generateExisting(
                'root_' + subEls[i],
                formData[subEls[i]],
                formData[this.props.formSchema?.[subEls[i]]?.dependentOnField]
              )
            }
          }
        }
      }
    } else {
      this.fetchInitialCodelist()
    }
  }

  fetchInitialCodelist = (selectedId, selectedVal) => {
    const { elementId, triggerAutoDependentDropdownOnChange, disableInitialDependentDropdown } = this.props
    let verbPath = svConfig.triglavRestVerbs.GET_TABLE_WITH_FILTER
    if (!verbPath) {
      console.log('Missing GET TABLE WS in configuration')
      return
    }
    let codelistName
    if (this.props.sectionName) {
      codelistName = this.props.formSchema[this.props.sectionName][this.props.fieldCode].codelistName
    } else {
      codelistName = this.props.formSchema[this.props.fieldCode].codelistName
    }
    verbPath = verbPath.replace('%session', this.props.svSession)
    verbPath = verbPath.replace('%objectName', 'SVAROG_CODES')
    verbPath = verbPath.replace('%searchBy', 'PARENT_CODE_VALUE')
    verbPath = verbPath.replace('%searchForValue', codelistName)
    verbPath = verbPath.replace('%rowlimit', '0')
    const restUrl = svConfig.restSvcBaseUrl + verbPath
    axios.get(restUrl).then((response) => {
      if (response.data) {
        this.generateInitialDropdown(response.data, elementId, selectedVal, triggerAutoDependentDropdownOnChange, disableInitialDependentDropdown)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  findCoreType = (stringId) => {
    let string = `root_`
    if (this.props.sectionName) {
      string = `root_${this.props.sectionName}_`
    }
    const regex = new RegExp(string, 'g')
    const coreType = stringId.replace(regex, '')
    if (this.props.sectionName) {
      return [this.props.sectionName, coreType]
    } else {
      return ['', coreType]
    }
  }

  generateInitialDropdown = (dbDataArray, elementId, selectedVal, triggerAutoOnChange, isDisabled) => {
    const { selectedInitialValue } = this.props
    let options = []
    if (!selectedVal) {
      options.push({
        id: 'default',
        key: 'default',
        name: 'default',
        value: '',
        selected: true,
        disabled: true,
        hidden: true
      })
    }

    // try to delete the original first item label
    try {
      const nodeList = document.querySelectorAll(`[for='${elementId}']`)
      nodeList[0].parentNode.removeChild(nodeList[0].parentNode.childNodes[0])
    } catch (error) {
      // could not find an element
      console.info(error)
    }

    const coreType = this.findCoreType(elementId)[1]
    let labelText
    let requiredFieldsArr
    if (!this.props.sectionName) {
      labelText = this.props.formConfig.properties[coreType].title
      requiredFieldsArr = this.props.formConfig.required
    } else {
      labelText = this.props.formConfig.properties[this.props.sectionName].properties[coreType].title
      requiredFieldsArr = this.props.formConfig.properties[this.props.sectionName].required
    }
    let requiredAttr = false
    if (isValidArray(requiredFieldsArr, 1) && requiredFieldsArr.includes(coreType)) {
      requiredAttr = true
    }

    for (let i = 0; i < dbDataArray.length; i++) {
      let selected = false
      if (selectedVal && selectedVal === dbDataArray[i]['SVAROG_CODES.CODE_VALUE']) {
        selected = true
      } else if (triggerAutoOnChange && selectedInitialValue) {
        selected = true
      }
      options.push({
        id: dbDataArray[i]['SVAROG_CODES.OBJECT_ID'],
        key: dbDataArray[i]['SVAROG_CODES.OBJECT_ID'],
        name: dbDataArray[i]['SVAROG_CODES.CODE_VALUE'],
        value: dbDataArray[i]['SVAROG_CODES.CODE_VALUE'],
        text: dbDataArray[i]['SVAROG_CODES.LABEL_CODE'],
        selected: selected
      })
    }

    const newElement = <Dropdown
      id={elementId}
      key={elementId + '_depddl'}
      labelText={labelText}
      style={this.style}
      defaultValue='default'
      name='initialDropdown'
      onChange={() => this.onChange(elementId)}
      options={options}
      required={requiredAttr}
      disabled={isDisabled}
    />
    this.setState({ initialDropdown: newElement })
    if (triggerAutoOnChange) {
      this.onChange(elementId, true)
    }
  }

  generateExisting = (elementId, selectedVal, parentVal) => {
    const { formSchema, svSession } = this.props

    const elementProperties = this.findCoreType(elementId)
    let groupPath
    if (this.props.sectionName) {
      groupPath = elementProperties[0]
    }
    const coreType = elementProperties[1]
    const elementOrder = formSchema[coreType]?.order
    let nextElementObj
    let newElement
    Object.keys(formSchema).forEach(key => {
      if (formSchema[key]?.dependentOnField && formSchema[key]?.order === elementOrder) {
        nextElementObj = formSchema[key]
        newElement = key
      }
    })
    const codelistName = nextElementObj?.codelistName || ''

    if (this.props.formInstance) {
      let newTableData = ComponentManager.getStateForComponent(this.props.formId, 'formTableData')
      if (groupPath) {
        if (newTableData[groupPath] && newTableData[groupPath].constructor === Object) {
          newTableData[groupPath][coreType] = parentVal
        } else {
          newTableData[groupPath] = {}
          newTableData[groupPath][coreType] = parentVal
        }
      } else {
        if (newTableData && newTableData.constructor === Object) {
          newTableData[coreType] = parentVal
        } else {
          newTableData = {}
          newTableData[coreType] = parentVal
        }
      }
      ComponentManager.setStateForComponent(this.props.formId, 'formTableData', newTableData)
      this.props.formInstance.setState({ formTableData: newTableData })
    }

    if (codelistName) {
      const wsPath = `ReactElements/getDependentDropdown/sid/${svSession}/codelist-name/${codelistName}/parent-code-value/${parentVal}`
      const url = `${window.server}/${wsPath}`
      axios.get(url).then((response) => {
        if (response.data) {
          let finalResponse = response.data
          // Check if the data is nested
          if (isValidObject(finalResponse.data, 1) && isValidArray(finalResponse.data?.items, 1)) {
            finalResponse = finalResponse.data
          }
          this.generateDropdown(finalResponse, newElement, groupPath, selectedVal)
        }
      }).catch((error) => {
        console.log(error)
      })
    }
  }

  clearFormData = (fieldName, groupPath) => {
    if (this.props.formInstance) {
      let newTableData = ComponentManager.getStateForComponent(this.props.formId, 'formTableData')
      if (groupPath) {
        if (newTableData[groupPath] && newTableData[groupPath].constructor === Object) {
          newTableData[groupPath][fieldName] = undefined
        } else {
          newTableData[groupPath] = {}
          newTableData[groupPath][fieldName] = undefined
        }
      } else {
        if (newTableData && newTableData.constructor === Object) {
          newTableData[fieldName] = undefined
        } else {
          newTableData = {}
          newTableData[fieldName] = undefined
        }
      }
      ComponentManager.setStateForComponent(this.props.formId, 'formTableData', newTableData)
      this.props.formInstance.setState({ formTableData: newTableData })
    }
  }

  removeElements = (parentNode, ddls, index) => {
    const arrow = parentNode.previousElementSibling
    parentNode.parentNode.removeChild(arrow)
    parentNode.removeChild(ddls[index])
    parentNode.removeChild(parentNode.childNodes[0])
    parentNode.parentNode.removeChild(parentNode)
  }

  onChange = (elementId, isInitial) => {
    const { getAdditionalData, additionalDataKey, selectedInitialValue, formSchema, svSession } = this.props

    const elementProperties = this.findCoreType(elementId)
    let groupPath
    if (this.props.sectionName) {
      groupPath = elementProperties[0]
    }
    const coreType = elementProperties[1]
    const elementOrder = formSchema[coreType]?.order
    let nextElementObj
    let newElement
    Object.keys(formSchema).forEach(key => {
      if (formSchema[key]?.dependentOnField && formSchema[key]?.order === elementOrder + 1) {
        nextElementObj = formSchema[key]
        newElement = key
      }
    })
    const codelistName = nextElementObj?.codelistName || ''

    try {
      // check if element exists
      const ddls = document.getElementsByTagName('SELECT')
      let nextElement
      if (groupPath) {
        nextElement = $('root_' + groupPath + '_' + newElement)
      } else {
        nextElement = $('root_' + newElement)
      }
      for (let i = 0; i < ddls.length; i++) {
        if (nextElement?.id === ddls[i].id) {
          for (let j = i; j < ddls.length; j++) {
            const el = this.findCoreType(ddls[j].id)[1]
            if (el === newElement) {
              let parentNode = ddls[j].parentNode
              ddls[j].value = ''
              this.removeElements(parentNode, ddls, j)
              this.clearFormData(newElement, groupPath)
            }
          }
          const el = this.findCoreType(ddls[i].id)[1]
          if (this.props.formSchema?.[this.props.sectionName]?.[el]?.dependentOnField) {
            let parentNode = ddls[i].parentNode
            ddls[i].value = ''
            this.removeElements(parentNode, ddls, i)
            break
          } else if (this.props.formSchema?.[el]?.dependentOnField) {
            let parentNode = ddls[i].parentNode
            ddls[i].value = ''
            this.removeElements(parentNode, ddls, i)
            break
          }
        }
      }
    } catch (error) { // eslint-disable-line
      throw error
    } finally {
      /* search only for dropdowns, since there are inputs with the same element
      IDs prsent in the document - from configuration */
      let el
      const list = document.getElementsByTagName('SELECT')
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === elementId) {
          el = list[i]
        }
      }
      let selectedVal = el.options[el.selectedIndex].value
      if (selectedInitialValue && isInitial) {
        selectedVal = selectedInitialValue
      }

      if (this.props.formInstance) {
        let newTableData = Object.assign({}, this.props.formInstance.state.formTableData)
        if (groupPath) {
          if (newTableData[groupPath] && newTableData[groupPath].constructor === Object) {
            newTableData[groupPath][coreType] = selectedVal
          } else {
            newTableData[groupPath] = {}
            newTableData[groupPath][coreType] = selectedVal
          }
        } else {
          if (newTableData && newTableData.constructor === Object) {
            newTableData[coreType] = selectedVal
          } else {
            newTableData = {}
            newTableData[coreType] = selectedVal
          }
        }
        this.props.formInstance.setState({ formTableData: newTableData })
      }

      if (codelistName) {
        const wsPath = `ReactElements/getDependentDropdown/sid/${svSession}/codelist-name/${codelistName}/parent-code-value/${selectedVal}`
        const url = `${window.server}/${wsPath}`
        axios.get(url).then((response) => {
          if (response.data) {
            if (getAdditionalData && additionalDataKey && response.data[additionalDataKey]) {
              store.dispatch({ type: 'ADDITIONAL_DEPENDENT_DROPDOWN_DATA', payload: response.data[additionalDataKey] })
            }
            let finalResponse = response.data
            // Check if the data is nested
            if (isValidObject(finalResponse.data, 1) && isValidArray(finalResponse.data?.items, 1)) {
              finalResponse = finalResponse.data
            }
            this.generateDropdown(finalResponse, newElement, groupPath)
          }
        }).catch((error) => {
          console.log(error)
        })
      }
    }
  }

  generateDropdown = (dbDataArray, newElement, groupPath, selectedVal) => {
    let prefix = 'root'
    if (groupPath) {
      prefix = 'root_' + groupPath
    }
    const elementId = prefix + '_' + newElement
    // Default blank dropdown option
    let options = [{
      id: 'default',
      key: 'default',
      name: 'default',
      value: '',
      selected: true,
      disabled: true,
      hidden: true
    }]

    // Create dropdown options
    for (let i = 0; i < dbDataArray.items.length; i++) {
      let decodedValue = dbDataArray.items[i]['LBL_TRANSL']
      let selected = false
      if (selectedVal && selectedVal === dbDataArray.items[i]['CODE_VALUE']) {
        selected = true
      }
      options.push({
        id: dbDataArray.items[i]['object_id'],
        key: dbDataArray.items[i]['object_id'],
        name: dbDataArray.items[i]['CODE_VALUE'],
        value: dbDataArray.items[i]['CODE_VALUE'],
        text: decodedValue,
        selected: selected
      })
    }

    // Generate the dropdown selector, labels and icons
    const ddlList = this.state.dynamicDropdowns.slice()
    const coreType = this.findCoreType(elementId)[1]
    let labelText
    let requiredFieldsArr
    if (!this.props.sectionName) {
      labelText = this.props.formConfig.properties[coreType].title
      requiredFieldsArr = this.props.formConfig.required
    } else {
      labelText = this.props.formConfig.properties[this.props.sectionName].properties[coreType].title
      requiredFieldsArr = this.props.formConfig.properties[this.props.sectionName].required
    }
    let requiredAttr = false
    if (isValidArray(requiredFieldsArr, 1) && requiredFieldsArr.includes(coreType)) {
      requiredAttr = true
    }

    ddlList.push(
      <i
        id={elementId + '_after'}
        key={elementId + '_after'}
        className={`icon-caret-${this.state.spread}`}
      />,
      <Dropdown
        id={elementId}
        style={this.additionalStyle}
        labelText={labelText}
        key={elementId + '_depddl'}
        name={elementId}
        onChange={() => this.onChange(elementId)}
        options={options}
        required={requiredAttr}
      />
    )
    this.setState({ dynamicDropdowns: ddlList })
  }

  render() {
    return (
      <React.Fragment>
        {this.state.initialDropdown}
        {this.state.dynamicDropdowns}
      </React.Fragment>
    )
  }
}

function mapStateToProps(state) {
  return {
    svSession: state.security.svSession
  }
}

export default connect(mapStateToProps)(DependentElements)
