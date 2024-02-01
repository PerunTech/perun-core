import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { svConfig } from '../../../config';
import { Dropdown, findWidget, $ } from '../..';
import { isValidArray } from '../../../functions/utils';

const right = {
  'display': 'inline-table'
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
    if (this.props.spread === 'down') {
      this.style = down
    }
  }

  componentDidMount () {
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
        const subEls = Object.keys(formData)
        for (let i = 0; i < subEls.length; i++) {
          if (subEls[i] === findWidget(this.props.formSchema, 'ui:widget', 'DependencyDropdown')) {
            this.fetchInitialCodelist(subEls[i], formData[subEls[i]])
          } else if (findWidget(this.props.formSchema, 'dependentOn', subEls[i - 1])) {
            this.generateExisting(
              'root_' + subEls[i - 1],
              formData[subEls[i]],
              formData[subEls[i - 1]]
            )
          }
        }
      }
    } else {
      this.fetchInitialCodelist()
    }
  }

  fetchInitialCodelist = (selectedId, selectedVal) => {
    // Load initial region codelist
    let verbPath = svConfig.triglavRestVerbs.GET_TABLE_WITH_LIKE_FILTER
    if (!verbPath) {
      console.log('Missing GET TABLE WS in configuration')
      return
    }
    let parentCodeValue
    if (this.props.sectionName) {
      parentCodeValue = this.getParentCodeValue(this.props.fieldCode, this.props.sectionName)
    } else {
      parentCodeValue = this.props.formSchema[this.props.fieldCode].parentCodeValue
    }
    verbPath = verbPath.replace('%session', this.props.svSession)
    verbPath = verbPath.replace('%objectName', 'SVAROG_CODES')
    verbPath = verbPath.replace('%searchBy', 'PARENT_CODE_VALUE')
    verbPath = verbPath.replace('%searchForValue', parentCodeValue)
    verbPath = verbPath.replace('%rowlimit', '10000')
    const restUrl = svConfig.restSvcBaseUrl + verbPath
    axios.get(restUrl).then((response) => {
      if (response.data) {
        this.generateInitialDropdown(response.data, this.props.elementId, selectedVal)
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

  getParentCodeValue = (element, groupPath) => {
    const obj = this.props.formSchema[groupPath]
    return obj[element].parentCodeValue
  }

  generateInitialDropdown = (dbDataArray, elementId, selectedVal) => {
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
    />
    this.setState({ initialDropdown: newElement })
  }

  generateExisting = (elementId, selectedVal, parentVal) => {
    const { ddVerbPath, tableName, svSession } = this.props
    if (!tableName) {
      console.error('Pass the table name as a prop (named tableName) when rendering a dependent dropdown')
      return
    }
    if (!ddVerbPath) {
      const msgOne = 'No WS path was found for building the dependent elements. '
      const example = 'For example: ReactElements/getDependentDropdown'
      const msgTwo = `Pass it as a prop (named ddVerbPath & not surrounded by slashes. ${example}) when rendering the GenericForm component.`
      console.warn(msgOne + msgTwo)
      return
    }

    const url = `${svConfig.restSvcBaseUrl}/${ddVerbPath}/${svSession}/${tableName}/${parentVal}`
    const elementProperties = this.findCoreType(elementId)
    const groupPath = elementProperties[0]
    const coreType = elementProperties[1]

    if (this.props.formInstance) {
      const newTableData = Object.assign({}, this.props.formInstance.state.formTableData)
      if (newTableData[groupPath] && newTableData[groupPath].constructor === Object) {
        newTableData[groupPath][coreType] = parentVal
      } else {
        newTableData[groupPath] = {}
        newTableData[groupPath][coreType] = parentVal
      }
      this.props.formInstance.setState({ formTableData: newTableData })
    }

    const newElement = findWidget(this.props.formSchema, 'dependentOn', coreType)

    axios.get(url).then((response) => {
      if (response.data) {
        this.generateDropdown(response.data, newElement, groupPath, selectedVal)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  removeElements = (parentNode, ddls, index) => {
    const arrow = parentNode.previousElementSibling
    parentNode.parentNode.removeChild(arrow)
    parentNode.removeChild(ddls[index])
    parentNode.removeChild(parentNode.childNodes[0])
    parentNode.parentNode.removeChild(parentNode)
  }

  onChange = (elementId, selectedVal) => {
    const { ddVerbPath, tableName, svSession } = this.props
    if (!tableName) {
      console.error('Pass the table name as a prop (named tableName) when rendering a dependent dropdown')
      return
    }
    if (!ddVerbPath) {
      const msgOne = 'No WS path was found for building the dependent elements. '
      const example = 'For example: ReactElements/getDependentDropdown'
      const msgTwo = `Pass it as a prop (named ddVerbPath & not surrounded by slashes. ${example}) when rendering the GenericForm component.`
      console.warn(msgOne + msgTwo)
      return
    }

    const elementProperties = this.findCoreType(elementId)
    let groupPath
    if (this.props.sectionName) {
      groupPath = elementProperties[0]
    }
    const coreType = elementProperties[1]

    const newElement = findWidget(this.props.formSchema, 'dependentOn', coreType)

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
        if (nextElement.id === ddls[i].id) {
          for (let j = i; j < ddls.length; j++) {
            const prevEl = this.findCoreType(ddls[j - 1].id)[1]
            const el = this.findCoreType(ddls[j].id)[1]
            if (el === findWidget(this.props.formSchema, 'dependentOn', prevEl)) {
              let parentNode = ddls[j].parentNode
              ddls[j].value = ''
              this.removeElements(parentNode, ddls, j)
            }
          }
          const el = this.findCoreType(ddls[i].id)[1]
          if (this.props.formSchema[this.props.sectionName][el].dependentOn) {
            let parentNode = ddls[i].parentNode
            ddls[i].value = ''
            this.removeElements(parentNode, ddls, i)
            break
          } else if (this.props.formSchema[el].dependentOn) {
            let parentNode = ddls[i].parentNode
            ddls[i].value = ''
            this.removeElements(parentNode, ddls, i)
            break
          }
        }
      }
    } catch (error) {
      console.info('No default next DOM element found, creating a new one...')
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
      const selectedVal = el.options[el.selectedIndex].value
      const url = `${svConfig.restSvcBaseUrl}/${ddVerbPath}/${svSession}/${tableName}/${selectedVal}`

      if (this.props.formInstance) {
        const newTableData = Object.assign({}, this.props.formInstance.state.formTableData)
        if (newTableData[groupPath] && newTableData[groupPath].constructor === Object) {
          newTableData[groupPath][coreType] = selectedVal
        } else {
          newTableData[groupPath] = {}
          newTableData[groupPath][coreType] = selectedVal
        }
        this.props.formInstance.setState({ formTableData: newTableData })
      }

      axios.get(url).then((response) => {
        if (response.data) {
          this.generateDropdown(response.data, newElement, groupPath)
        }
      }).catch((error) => {
        console.log(error)
      })
    }
  }

  generateDropdown = (dbDataArray, newElement, groupPath, selectedVal) => {
    const prefix = 'root_' + groupPath
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
        style={this.style}
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

  render () {
    return (
      <React.Fragment>
        {this.state.initialDropdown}
        {this.state.dynamicDropdowns}
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    svSession: state.security.svSession
  }
}

export default connect(mapStateToProps)(DependentElements)