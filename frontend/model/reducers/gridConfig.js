export default function gridConfig(state = {
  gridHierarchy: []
  // other initial state...
}, action) {
  switch (action.type) {
    case 'ADDGRID': {
      // GPE:This should probably be changed in order to be REDUX compliant
      let currGrids
      if (!state[action.group]) {
        currGrids = []
      } else {
        currGrids = state[action.group]
        for (const key in currGrids) {
          const value = currGrids[key]
          if (value.id === action.id) {
            currGrids.splice(key, 1)
          }
        }
      }
      currGrids.push({
        id: action.id,
        grid: action.payload
      }) // add a new object

      return { ...state, [action.group]: currGrids }
    }
    case 'REMOVEGRID': {
      // GPE:This should probably be changed in order to be REDUX compliant
      let currGrids
      if (!state[action.group]) {
        currGrids = []
      } else {
        currGrids = state[action.group]
        if (currGrids !== undefined) {
          for (const key in currGrids) {
            const value = currGrids[key]
            if (value.id === action.id) {
              currGrids.splice(key, 1)
            }
          }
        }
      }
      return { ...state, [action.group]: currGrids }
    }

    case 'CLEAN_GRIDS': {
      // GPE:This should probably be changed in order to be REDUX compliant
      return { ...state, [action.group]: undefined }
    }

    case 'ADD_LAST_SELECTED_ITEM': {
      let gridType = removeNumbersFromStringAndCutWhereFirstNumIsFound(action.payload[0])
      const lastSelectedItem = {
        gridType: gridType,
        gridId: action.payload[0],
        row: action.payload[1],
        config: action.payload[2],
        active: true
      }
      const allGrids = state.gridHierarchy
      for (let i = 0; i < allGrids.length; i++) {
        // When a new item is selected all other active elements must be set to false
        if (allGrids[i].gridId === lastSelectedItem.gridId) {
          allGrids[i].active = true
        } else {
          allGrids[i].active = false
        }
        /* If we find a grid with the same core ID, replace it with the newer selected object of the same subset.
        Example: select one object -> go back -> select another object fo the same subset ->
        The newer object replaces the old one
        */
        let oldCoreType = allGrids[i].gridType
        let newCoreType = lastSelectedItem.gridType
        if (oldCoreType === newCoreType) {
          allGrids.splice(i, 1)
        }
      }
      // If no components with the same ID are found in the global state, add the current element
      // The array.some() function returns false if no elements pass the callback test
      if (!allGrids.some((element) => {
        return lastSelectedItem.gridId === element.gridId
      })) {
        allGrids.push(lastSelectedItem)
      }
      return { ...state, gridHierarchy: allGrids }
    }

    case 'SWITCH_SELECTED_ITEM': {
      // This function switches the selected item by setting the active key in the new object (action.payload) to true
      const gridId = action.payload
      const gridHierarchy = state.gridHierarchy
      if (gridHierarchy.length > 0) {
        for (let i = 0; i < gridHierarchy.length; i++) {
          if (gridHierarchy[i].gridId === gridId) {
            gridHierarchy[i].active = true
          } else {
            gridHierarchy[i].active = false
          }
        }
      }
      return { ...state, gridHierarchy: gridHierarchy }
    }

    case 'CLEAN_ALL_SELECTED_ITEMS': {
      return { ...state, gridHierarchy: [] }
    }

    case 'REPLACE_ALL_SELECTED_ITEMS': {
      return { ...state, gridHierarchy: action.payload }
    }

    default: {
      return state
    }
  }
}

function removeNumbersFromStringAndCutWhereFirstNumIsFound(string) {
  let formattedString = string.split('_')
  if (formattedString.length > 1) {
    for (let j = 0; j < formattedString.length; j++) {
      if (!isNaN(parseFloat(formattedString[j + 1]))) {
        formattedString = formattedString.slice(0, j + 1)
        break
      }
    }
  }
  formattedString = formattedString.join()
  formattedString = formattedString.replace(/,/g, '_')
  return formattedString
}
