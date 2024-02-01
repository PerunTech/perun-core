import axios from 'axios'
import { svConfig } from '../../config';

export function notificationAction (wsPath) {
  const restUrl = svConfig.restSvcBaseUrl + (wsPath)
  console.log(restUrl);
  return function (dispatch) {
    dispatch({ type: 'NOTIFICATION_DATA_PENDING', message: undefined })
    axios.get(restUrl)
      .then((response) => {
        dispatch({ type: 'NOTIFICATION_DATA_FULFILLED', message: response.data })
      }).catch((err) => {
        dispatch({ type: 'NOTIFICATION_DATA_REJECTED', message: err })
      })
  }
}