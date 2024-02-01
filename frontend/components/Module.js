import React from 'react'
import { store } from '../model';
import { AppSettings, MainFooter, HomeMenu, DocumentManager } from 'components/ComponentsIndex'

const Module = ({ match }) => {
  let component = null
  /* get token in cookie f.r */
  /*to do change sessionedbar to session */
  document.cookie = "sessionedbar=" + store.getState().security.svSession
  let url = window.location.href
  let arr = url.split("/");
  let currentUrl = arr[0] + "//" + arr[2]

  switch (match.params.name) {

    case 'edbar': {
      component = location.replace(currentUrl + '/edbar/indexedbar.html');
      break
    }
    case 'batch': {
      component = location.replace(currentUrl + '/edbar/index.html');
      break
    }
    case 'user_manager': {
      component = <AppSettings />
      break
    }
    case 'document_manager': {
      component = <DocumentManager />
      break
    }
    default: {
      component = null
      break
    }
  }

   /* send matchProp to HomeMenu */
  return (<React.Fragment> <HomeMenu matchProps={match} /> <div id='mainContainer' className='subModMain' >
    {component}
  </div> <MainFooter /></React.Fragment>)
}

export default Module
