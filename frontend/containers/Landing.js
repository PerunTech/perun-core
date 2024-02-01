import React from 'react'
import { Route } from 'react-router-dom'
import Logon from 'components/Logon/Logon'

class Landing extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      component: null
    }
  }

  componentDidMount() {
    localStorage.clear();
  }

  render() {
    return (
      <React.Fragment>
        {/* <div id='main' className={'main ' + style['grid-container'] + ' ' + style.fadeIn}> */}
        <Route path='/home/:logonComp' render={props => <Logon {...props} />} />
        {/* </div> */}
      </React.Fragment>
    )
  }
}

export default Landing
