import React from 'react'
import axios from 'axios'
import { alertUser } from '../../../elements'

class ShowNotification extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      generatedHtmlElement: '',
    }
  }

  componentDidMount() {
    this.simpleAxios('userIp')
  }

  simpleAxios = (param) => {
    if (param) {
      let url
      let th1s = this
      if (param === 'userIp') {
        url = 'https://api.ipify.org?format=json'
      } else {
        url = window.server + '/PublicWs/getNotifications' + '/' + th1s.state.userIp
      }
      axios.get(url).then((response) => {
        if (response.data) {
          if (param === 'iterateNotify') {
            if (response.data.data) {
              th1s.iterateNotify(response.data.data)
            }
          } else {
            th1s.setState({ userIp: response.data.ip })
            th1s.simpleAxios('iterateNotify')
          }
        }
      }).catch((err) => {
        if (err) {
          if (err.data) {
            if (err.data.type) {
              alertUser(true, err.response.data.type.toLowerCase(), err.response.data.message, null)
            }
          }
        }
      })
    }
  }

  iterateNotify = (data) => {
    let elementArr = []
    let htmlElement
    data.map((item, i) => {
      htmlElement = <p key={i}>
        <b>{`${item.TITLE}`}</b><br /><br /><p>{`${item.MESSAGE}`}</p>
      </p>
      elementArr.push(htmlElement)
    })
    this.setState({ generatedHtmlElement: elementArr })
  }

  render() {
    const { generatedHtmlElement } = this.state
    return (
      <div className='notifications'>
        {generatedHtmlElement}
      </div>
    )
  }
}

export default ShowNotification

