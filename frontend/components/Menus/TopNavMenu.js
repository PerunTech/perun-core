import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
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
    }
    this.getTopMenuJson()
  }

  componentDidUpdate(prevProps) {
    if (this.props.moduleLinks !== prevProps.moduleLinks) {
      this.iterateLinks(this.props.moduleLinks?.data?.data || [])
    }
  }

  getTopMenuJson = () => {
    const url = `${window.json}${window.assets}/json/config/TopNavMenu.json`
    fetch(url)
      .then(res => res.json())
      .then(json => this.setState({ json }))
      .catch(err => { throw err })
  }
  /*generate sidenav element links */
  iterateLinks(urlData) {
    if (urlData.length > 0) {
      let createdUrl = []
      for (let i = 0; i < urlData.length; i++) {
        if (urlData[i].id && urlData[i].id !== 'perun-assets' && urlData[i].id !== 'spatial') {
          createdUrl.push(<Link onClick={this.closeHamb} key={urlData[i].id} to={'/main/' + urlData[i].id}>
            {this.buttonHtml(urlData[i].id, urlData[i].title)}
          </Link>)
        }
      }
      this.setState({ createdUrlState: createdUrl })
    }
  }

  /* return top-nav menu html element */
  buttonHtml(id, btnTitle) {
    return <button className='url-el'>
      <div className='button-flex'>
        {iconManager.getIcon(id)}<span>
          {btnTitle}
        </span>
      </div>
    </button>
  }

  showElements() {
    this.setState({ showElements: true })
    this.iterateLinks(this.props.moduleLinks?.data?.data || [])
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
  moduleLinks: state.moduleLinks.data
})

export default connect(mapStateToProps)(TopNavMenu)
