import React from 'react';
import PropTypes from 'prop-types';
import styles from './navStyle.module.css'

function lowerCaseAllWordsExceptFirstLetters (string) {
  return string.replace(/\w\S*/g, word => word.charAt(0) + word.slice(1).toLowerCase())
}

function removeNumbersFromString (string) {
  var formattedString = string.split('_')
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

const ReduxNavigator = (props) => {
  let itemsList = []
  let route = ''
  const {
    componentStack, lastSelectedItem, configuration, redirect
  } = props
  if (componentStack) {
    itemsList = componentStack.map((element) => {
      const dataset = element.gridId
      const gridType = removeNumbersFromString(dataset)
      let icon
      if (configuration instanceof Function) {
        icon = configuration(gridType).ICON
      }
      if (redirect) {
        if (!route) route = `/${gridType.toLowerCase()}`
        else route = `${route}/${gridType.toLowerCase()}`
      }
      const label = ` ${lowerCaseAllWordsExceptFirstLetters(gridType)}`
      return (<li id={`list_nav_${dataset}`} key={`list_nav_${dataset}`} onClick={() => { lastSelectedItem(dataset) }}>
        <a id={`link_nav_${dataset}`} {...redirect && { href: `#${route}` }}>
          <span id={`span_${dataset}`} className={`icon ${icon}`} />
          <span id={`span_${dataset}`} className='text'>{label}</span>
        </a>
      </li>)
    })
  }
  return (
    <ul id='redux_nav_list' key='redux_nav_list' className={styles.breadcrumb}>
      {itemsList.reverse()}
      <li id='list_nav_home' key='list_nav_home'>
        <a id='link_nav_home' href='#'>
          <span id='span_icon-home' className='icon icon-home' />
        </a>
      </li>
    </ul>
  )
}

ReduxNavigator.contextTypes = {
  intl: PropTypes.object.isRequired
}

ReduxNavigator.propTypes = {
  componentStack: PropTypes.array,
  lastSelectedItem: PropTypes.func.isRequired,
  configuration: PropTypes.func
}

export default ReduxNavigator;
