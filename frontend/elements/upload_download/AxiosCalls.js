/**
* MANDATORY PARAMETERS
* @param {array} urlArr - array of ws
* @param {string} session - props svSession
* @param {string} methodType - 'post' or 'get' method for axios
* @param {function} hasCallback - callback function to execute something
* OPTIONAL PARAMETERS
* @param {object} form_params - form_params for 'post' method
*/

import axios from 'axios'
import { alertUser } from '../util/alertUser';


export function axiosCall (urlArr, session, hasCallback, methodType, form_params) {
  if (urlArr) {
    for (let i = 0; i < urlArr.length; i++) {
      console.log('i', i);
      console.log('urlArr[i]', urlArr[i]);
      axios({
        method: methodType,
        data: form_params,
        url: urlArr[i],
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then((response) => {
        console.log('response', response);
        if (response.data) {
          if (response.data.type === 'ERROR' && response.data.title === 'Невалидна сесија') {
            alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
          } else {
            console.log('hascallback success')
            hasCallback(response.data, urlArr.length-1, i)
          }
        }
      }).catch((error) => {
        console.log('error', error);
        if (error.response.status === 500 ) {
          hasCallback(error.response)
        } else {
          if (error.response && error.response.data && error.response.data.type) {
            hasCallback(error.response.data, urlArr.length-1, i)
          }
        }
      })
    }
  } else {
    console.warn('Check your params')
  }
}