import React from 'react'

/**
  * Wrapper component for displaying grids & forms 
  * The floatHolder prop currently can have two values (context-menu-data-holder-left & context-menu-data-holder-right)
  * which tell the component on which side of the screen the grid or form should be rendered
  * The default position is on the right-hand side of the screen
*/
const MainDataHolder = ({ gridState, formState, searchState, floatHolder, additionalDataClassName }) => {
  let dataHolderClassName = floatHolder
  if (additionalDataClassName) {
    dataHolderClassName += ` ${additionalDataClassName}`
  }
  return <div className={dataHolderClassName}>
    {searchState && (
      <div
        style={{
          marginLeft: floatHolder === 'context-menu-data-holder-right' ? '30vh' : '50vh',
          marginRight: floatHolder === 'context-menu-data-holder-right' ? '50vh' : '30vh',
          marginBottom: '3vh'
        }}
      >
        {searchState}
      </div>
    )}
    <div>
      {gridState}
      {formState}
    </div>
  </div>
}

export default MainDataHolder
