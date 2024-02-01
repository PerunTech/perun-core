import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import createHashHistory from 'history/createHashHistory';
import { store } from '../../../model';
import defaultCSS from './RecordInfo.module.css';

const hashHistory = createHashHistory()

let recordInfoStyles = ''
// Import Project CSS
import('modulesCSS/RecordInfo.module.css').then((projectCSS) => {
  // Check if class is present in css, temporary workaround of webpack bug
  // true code should be in catch block
  // github issue https://github.com/webpack/webpack/issues/5662
  if (!projectCSS.checkIfCSSisPresent) {
    console.log('No external style for RecordInfo.module.css')
    // load defaultCSS
    recordInfoStyles = defaultCSS
  } else {
    recordInfoStyles = projectCSS
  }
  return recordInfoStyles
}).catch(() => {
  // this block never executes and blocks webpack-dev-server terminal
  // webpack bug
  console.log('No external style for RecordInfo.module.css')
})

function decodeValueFromCodelist (valueToDecode, item) {
  let decodedValue
  if (item.formatterOptions && item.formatterOptions.length > 0) {
    for (let i = 0; i < item.formatterOptions.length; i++) {
      if (valueToDecode === item.formatterOptions[i].id) {
        decodedValue = item.formatterOptions[i].text
      }
    }
  }
  return decodedValue || valueToDecode
}
function getConfigFromFile (configuration, renderedGrids, context) {
  const bulkData = []
  for (let k = 0; k < renderedGrids.length; k++) {
    if (renderedGrids[k].rowClicked && Object.keys(renderedGrids[k]).length > 0) {
      let generatedData = ''
      let dataType = renderedGrids[k].id
      const gridArr = dataType.split('_')
      if (gridArr.length > 1) {
        if (!isNaN(parseFloat(gridArr.slice(-1)[0]))) {
          gridArr.pop()
        }
        dataType = gridArr.toString().replace(',', '_')
      }
      const itemsObject = configuration(dataType, context.intl)
      const itemsArray = itemsObject.CHOSEN_ITEM
      const spacing = ': '
      for (let i = 0; i < itemsArray.length; i++) {
        let label = itemsArray[i].LABEL
        const emptyLine = <br key={`${itemsArray[i].ID}_LINEBREAK`} />
        let value = ''
        if (itemsArray[i].VALUE instanceof Array &&
          renderedGrids[k].rowClicked[itemsArray[i].VALUE[0]] &&
          renderedGrids[k].rowClicked[itemsArray[i].VALUE[1]]) {
          value = `${spacing + renderedGrids[k].rowClicked[itemsArray[i].VALUE[0]]} ${renderedGrids[k].rowClicked[itemsArray[i].VALUE[1]]}`
        } else if ((typeof itemsArray[i].VALUE === 'string' || itemsArray[i].VALUE instanceof String) &&
            renderedGrids[k].rowClicked[itemsArray[i].VALUE]) {
          value = spacing + renderedGrids[k].rowClicked[itemsArray[i].VALUE]
          if (itemsArray[i].LINK_TO_PARRENT_BY) {
            let criteria
            store.dispatch(itemsArray[i].LINK_FUNC(
              renderedGrids[k].rowClicked[itemsArray[i].VALUE].toString(),
              (response) => {
                criteria = response
              }
            ))
            const click = () => hashHistory.push(`/main/dynamic/${itemsArray[i].LINK_TO_TABLE.toLowerCase()}?c=${itemsArray[i].LINK_TO_PARRENT_BY}&v=${criteria}`)
            label =
              (<span
                style={{
                  color: '#c8990e',
                  cursor: 'pointer'
                }}
                onClick={click}
                key={`${itemsArray[i].ID}URL`}
              >
                {`${itemsArray[i].LABEL}${value}`}
              </span>)
            value = true
          }
        } else {
          value = ''
        }
        if (value) {
          generatedData = [generatedData, emptyLine, label, value]
        }
      }
      bulkData.push(generatedData)
    }
  }
  return bulkData
}

function getConfigFromDb (menuType, configuration, renderedGrids) {
  const value = []
  const newLine = <br />
  for (let i = 0; i < renderedGrids.length; i++) {
    for (let o = 0; o < configuration.objects.length; o++) {
      if (renderedGrids[i].gridId === configuration.objects[o] || (renderedGrids[i].gridId.indexOf(configuration.objects[o]) > -1)) {
        const selectedItem = renderedGrids[i].row
        for (let j = 0; j < configuration.info.length; j++) {
          let generatedData = ''
          if (selectedItem[configuration.info[j].value]) {
            let labelName
            for (let lbl = 0; lbl < renderedGrids[i].config.length; lbl++) {
              if (renderedGrids[i].config[lbl].key === configuration.info[j].value) {
                labelName = renderedGrids[i].config[lbl].name
                const label = `${labelName}: ${decodeValueFromCodelist(selectedItem[configuration.info[j].value], renderedGrids[i].config[lbl])}`
                generatedData = [label, newLine]
                value.push(generatedData)
              }
            }
          }
        }
      }
    }
  }
  return value
}
// displays logged in user's username and selected record's
// type, id/properties...
const RecordInfo = (props, context) => {
  let bulkData = []
  const { renderedGrids, configuration, menuType } = props
  if (configuration && renderedGrids && renderedGrids.length) {
    if (configuration instanceof Function) {
      bulkData = getConfigFromFile(configuration, renderedGrids, context)
    } else {
      bulkData = getConfigFromDb(menuType, configuration, renderedGrids)
    }
  }
  return (
    <div id='record_info' className={recordInfoStyles.divMainContent}>
      <p id='selected_item' className={recordInfoStyles.selected_item}>
        {props.menuType}
        {bulkData}
      </p>
    </div>
  )
}

RecordInfo.propTypes = {
  menuType: PropTypes.string,
  renderedGrids: PropTypes.array,
  configuration: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired
}

RecordInfo.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  let renderedGrids
  const dynamicComponents = state.gridConfig.gridHierarchy.length
  if (dynamicComponents > 0) {
    renderedGrids = state.gridConfig.gridHierarchy
  }
  return ({
    renderedGrids
  })
}

export default connect(mapStateToProps)(RecordInfo)
