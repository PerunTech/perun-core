import axios from 'axios';
import { svConfig } from '../../config';

export function dropLinkObjectsAction (argsObject) {
  return function (dispatch) {
    let verbPath
    let restUrl

    const tempVar = 'DROP_LINK_OBJECTS'

    verbPath = svConfig.triglavRestVerbs.DROP_LINK_OBJECTS
    restUrl = svConfig.restSvcBaseUrl + verbPath

    restUrl = restUrl.replace('%session', argsObject.SESSION)
    restUrl = restUrl.replace('%objectId1', argsObject.OBJECTID1)
    restUrl = restUrl.replace('%tableName1', argsObject.TABLE)
    restUrl = restUrl.replace('%objectId2', argsObject.OBJECTID2)
    restUrl = restUrl.replace('%tableName2', argsObject.LINKEDTABLE)
    restUrl = restUrl.replace('%linkName', argsObject.LINKNAME)

    let {id} = argsObject

    dispatch({ type: `${tempVar}_DATA_PENDING`, payload: undefined })
    axios.get(restUrl)
      .then(() => {
        dispatch({ id: id, type: id + '/SAVE_FORM_DATA', payload: true })
      }).catch((err) => {
        dispatch({id: id, type: id + '/REJECTED_FORM_DATA', payload: err})
      })
  }
}
