import React from 'react'
import style from './AttachmentStyles.module.css'
import { iconManager } from '../../assets/svg/svgHolder'
import { axiosCall } from './AxiosCalls'

/**
* MANDATORY PARAMETERS
* @param {string} data - recieved files that have been uploaded
* @param {string} session - session
* OPTIONAL PARAMETERS
* @param {boolean} funct - delete function callback
* @param {boolean} readOnly - show or hide delete button
* @param {object} context - context
*/

export const attachmentButtons = (data, session, funct, context, readOnly) => {
  console.log(context)
  let downloadableItem
  let elementArr = []
  if (data.data.items) {
    elementArr.push(<p className={`${style.labelStyle}`}> {context.intl.formatMessage({ id: 'perun.show_uploads', defaultMessage: 'perun.show_uploads' })}</p>)
    let file = data.data.items
    file.map((el) => {
      downloadableItem = <div  className={`${style.downloadableItemDiv}`}>
        <button 
          id='fileNameUpload' 
          className={`${style.fileNameUpload}`} 
          onClick={(e) => downloadFile(el, e, session)}>
          {iconManager.getIcon('downloadFileAtt')}{el.FILE_NAME}
        </button>
        {(readOnly !== true) && <button 
          id='deleteBtn' 
          className={`${style.deleteFileBtn}`} 
          onClick={(e) => deleteDownload(el, e, session, funct)}>
          {iconManager.getIcon('deleteAtt')}
        </button>}
      </div>
      elementArr.push(downloadableItem)
    })
  }
  return elementArr
}

function downloadFile (el, e, svSession) {
  e.preventDefault()
  if (el['object_id'] && el['FILE_NAME']) {
    let url = window.server + `/WsIpardSpa/downloadFile/${svSession}/${el['object_id']}/${el['FILE_NAME']}`
    window.open(url, '_blank')
  }
}

function deleteDownload (el, e, svSession, funct) {
  e.preventDefault()
  let deleteObj = {'OBJECT_ID': el['object_id'], 'OBJECT_TYPE': 2}
  console.log(deleteObj, 'deleteobj')
  let urlArr = []
  urlArr.push(window.server + `/ReactElements/deleteObject/${svSession}`)
  axiosCall(urlArr, svSession, funct, 'post', deleteObj)
}
