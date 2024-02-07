import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { svConfig } from '../../config';
import { alertUser } from '../../elements';
import { iconManager } from '../../assets/svg/svgHolder';

class TopNavMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      json: [],
    }
    this.state = { showElements: false }
    this.iterateLinks = this.iterateLinks.bind(this)
    this.showElements = this.showElements.bind(this)
    this.closeHamb = this.closeHamb.bind(this)
    this.buttonHtml = this.buttonHtml.bind(this)
  }

  componentDidMount() {
    let mainroute = window.location.hash
    mainroute = mainroute.split('/').pop()
    if (mainroute === 'main') {
      document.getElementById('hideHamb').className = 'hideHambMenu';
    }
    this.getTopMenuJson()
  }
  componentDidUpdate(prevProps) {
    if (this.props.projectLinks !== prevProps.projectLinks) {
      this.iterateLinks(this.props.projectLinks.data.data)
    }
  }

  getTopMenuJson = () => {
    const url = `${window.location.origin}${window.assets}/json/config/TopNavMenu.json`
    fetch(url)
      .then(res => res.json())
      .then(json => this.setState({ json }))
      .catch(err => { throw err })
  }

  // getCardsData() {
  //   let type
  //   const url = svConfig.restSvcBaseUrl + svConfig.triglavRestVerbs.GET_CONFIGURATION_MODULE_DB + this.props.svSession
  //   axios.get(url)
  //     .then((response) => {
  //       if (response.data) {
  //         this.iterateLinks(response.data.data)
  //         console.log(response.data.data);

  //       }
  //     })
  //     .catch((response) => {
  //       type = response.response.data.type
  //       type = type.toLowerCase()
  //       this.setState({ alert: alertUser(true, type, response.response.data.message, null, null) })
  //     })
  // }

  /*generate sidenav element links */
  iterateLinks(urlData) {
    if (urlData) {
      let createdUrl = []
      for (let i = 0; i < urlData.length; i++) {
        if (urlData[i].id && urlData[i].id !== 'perun-assets' && urlData[i].id !== 'spatial') {
          if (urlData[i].id === 'edbar') {
            let url = window.location.href
            let arr = url.split("/")
            let currentUrl = arr[0] + "//" + arr[2]
            createdUrl.push(this.buttonHtml(urlData[i].id, urlData[i].title, currentUrl + '/edbar/indexedbar.html'))
          } else {
            createdUrl.push(<Link onClick={this.closeHamb} key={urlData[i].id} to={'/main/' + urlData[i].id}>
              {this.buttonHtml(urlData[i].id, urlData[i].title)}
            </Link>)
          }
        }
      }
      this.setState({ createdUrlState: createdUrl })
    }
  }

  /* return top-nav menu html element */
  buttonHtml(id, btnTitle, redirectEdbar) {
    let onClick = redirectEdbar ? () => location.replace(redirectEdbar) : null
    return <button onClick={onClick} className='url-el'>
      <div className='button-flex'>
        {iconManager.getIcon(id)}<span>
          {btnTitle}
        </span>
      </div>
    </button>
  }

  showElements() {
    this.setState({ showElements: true })
  }

  closeHamb() {
    this.setState({ showElements: false })
  }

  render() {
    const systemMenuLabel = this.context.intl.formatMessage({ id: 'perun.system_menu', defaultMessage: 'perun.system_menu' });
    const { json } = this.state
    return (
      <React.Fragment>
        <div id='hideHamb' onClick={this.showElements}>
          <div className='btn btn_background' data-toggle='tooltip' data-placement='right' title={systemMenuLabel}>{iconManager.getIcon('menuBars')}</div>
        </div>
        {this.state.showElements &&
          <div className='overlay'>
            <div className='top-nav-flex'>
              <div className='left-wrapper slide-from-left'>
                <div className='top-nav-flex padding'>
                  {iconManager.getIcon('slideMenuIcons')}<div className='menuTitle'>{systemMenuLabel}</div>
                  <div className='top-nav-flex-end' onClick={this.closeHamb} >
                    <div className='menuIcons white-icon'>
                      {iconManager.getIcon('close')}
                    </div>
                  </div>
                </div>
                <div className='side-el-holder'>
                  {this.state.createdUrlState}
                  {json?.length > 0 && (
                    <div className='list-title'>
                      {json.map((element) => {
                        if (element.href) {
                          return <><img src={element.src} id={element.id} className={element.imgClassName} />
                            <a id={element.labelId} href={element.href} className={element.labelClassName}>{element.label}</a>
                          </>
                        } else {
                          return <><img src={element.src} id={element.id} className={element.imgClassName} />
                            <p id={element.labelId} className={element.labelClassName}>{element.label}</p>
                          </>
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className='right-wrapper' onClick={this.closeHamb} />
            </div>
          </div>
        }
      </React.Fragment>
    )
  }
}

TopNavMenu.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
  projectLinks: state.projectLinks.data
})

export default connect(mapStateToProps)(TopNavMenu)
