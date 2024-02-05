import React from 'react';
import PropTypes from 'prop-types';

const PreviewData = (props) => {
  let selectedItem = []
  let view = []
  const element = document.getElementById('selected_item')
  if (element) {
    const text = element.innerText
    const lines = text.split('\n')
    for (let j = 1; j < lines.length; j++) {
      selectedItem.push(
        <div id={`holder_${j}`} key={`holder_${j}`}>
          <span id={`item_${j}`} key={`item_${j}`} className='preview-line'>{lines[j]}</span>
        </div>
      )
    }
    if (props.items) {
      for (let i = 0; i < props.items.length; i++) {
        const id = props.items[i].ID
        const type = props.items[i].TYPE
        for (let j = 0; j < props.componentStack.length; j++) {
          if (type === props.componentStack[j].gridId) {
            view.push(
              <div id={`${id}_container`} key={id}>
                <span id={id} className='preview-line'>{`${props.items[i].LABEL}: ${props.componentStack[j].row[`${type}.NAME`]}`}</span>
              </div>
            )
          }
        }
      }
    }
  }

  return <div id='previewData' className='preview-data-holder'>
    {selectedItem}
    {view}
  </div>
}

PreviewData.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default PreviewData
