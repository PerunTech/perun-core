import { connect } from 'react-redux';
import createHashHistory from 'history/createHashHistory';
import { store, lastSelectedItem } from '../../model';

const hashHistory = createHashHistory()

function isNumber (obj) {
  return !isNaN(parseFloat(obj))
}
const HandleItemSelection = (targetComponent) => {
  const mapDispatchToProps = () => ({
    lastSelectedItem: id => store.dispatch(lastSelectedItem(id))
  })

  const mapStateToProps = (state) => {
    let parentGrid
    let componentStack
    try {
      const dynamicComponents = state.gridConfig.gridHierarchy.length
      if (dynamicComponents > 0) {
        componentStack = state.gridConfig.gridHierarchy
        for (let i = 0; i < dynamicComponents; i++) {
          // The current selected element is the one where the active key is set to true
          // There can be ONLY ONE active element at any given time in the grid stack
          if (componentStack[i].active) {
            parentGrid = componentStack[i]
            break
          }
        }
        /* Get the core grid ID (without the _${OBJECTID} value from the key value by splitting the string)
        And removing any numbers found in the resulting array
        Afterwards, reconstruct the string */
        var gridType = parentGrid.gridId
        var gridArr = gridType.split('_')
        if (gridArr.length > 1) {
          for (let j = 0; j < gridArr.length; j++) {
            if (isNumber(gridArr[j + 1])) {
              gridArr = gridArr.slice(0, j + 1)
              break
            }
          }
          // replace all "," occurences with "_" in grid type string
          gridArr = gridArr.join()
          gridType = gridArr.replace(/,/g, '_')
        }
      } else {
        console.warn('Could not find parent configuration')
        // add empty objects in case configuration is not present
        // so application wont freeze and redirect to main screen
        gridType = ''
        parentGrid = { gridId: '', row: {} }
        hashHistory.push('/')
      }
    } catch (error) {
      console.warn(error)
    }
    return ({
      gridType,
      parentGrid: parentGrid.gridId,
      parentId: parentGrid.row[`${gridType}.PARENT_ID`],
      objectId: parentGrid.row[`${gridType}.OBJECT_ID`],
      parentTypeId: parentGrid.row[`${gridType}.OBJECT_TYPE`],
      componentStack,
      svSession: state.security.svSession,
      stateTooltip: state.stateTooltip.stateTooltip
    })
  }
  return connect(mapStateToProps, mapDispatchToProps)(targetComponent)
}

export default HandleItemSelection
