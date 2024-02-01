import React from 'react';
import PropTypes from 'prop-types';
// import { classRecordInfo } from '../../config';
import { HandleItemSelection, SideMenu, RecordInfo  } from '..';

/* After an item is selected from the search grid, the wanted data for the record
is rendered in the following component - shallow rendered by MainApp, inherits (SOME, NOT ALL)
props and state from MainApp KNI 28.03.2017 */
const SelectedItem = (props) => {
  const {
    gridType, parentId, objectId, className, enableMultiSelect, onSelectChangeFunct
  } = props
  // the last three props are custom component-specidifc and are not received by the controlling wrapper
  return (
    <div className={className}>
      {/* Side menu, used to display different subgrid with data,
        connected to the selected record from the basic search grid KNI 28.03.2017 */}
      {objectId &&
      <SideMenu
        {...props}
        enableMultiSelect={enableMultiSelect}
        onSelectChangeFunct={onSelectChangeFunct}
        menuType={gridType}
        key={`${gridType}_MENU_${parentId}`}
      >
        {<RecordInfo {...props} menuType={gridType} />}
      </SideMenu>
      }
    </div>
  )
}

SelectedItem.propTypes = {
  gridType: PropTypes.string.isRequired,
  parentId: PropTypes.number.isRequired,
  objectId: PropTypes.number.isRequired,
  configuration: PropTypes.func.isRequired,
  componentStack: PropTypes.array,
  lastSelectedItem: PropTypes.func.isRequired
}

export default HandleItemSelection(SelectedItem)
