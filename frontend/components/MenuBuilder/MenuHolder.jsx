import React from 'react'
import MenuFunctions from './MenuFunctions'

export default function MenuHolder (props) {
  return <MenuFunctions moduleNameProp={props.moduleNameProp} customJsonProp={props.customJsonProp} wsConfGetMenuProp={props.wsConfGetMenuProp}  customContRenderL={props.customContRenderL} customContRenderR={props.customContRenderR}/>
}
