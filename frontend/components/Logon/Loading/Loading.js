import React from 'react'
import CSSModules from 'react-css-modules'
import style from './Loading.module.css'

const Loading = () => {
  return (
    <div style={{
      position: 'absolute', width: '100%', height: '100%', top: '0', left: '0', zIndex: '9999', backgroundColor: 'rgba(0,0,0, 0.3)'
    }}>
      <span className={style['loader']}><span className={style['loader-inner']} /></span>
    </div>
  )
}

export default CSSModules(Loading, style, { allowMultiple: true, handleNotFoundStyleName: 'log' })
