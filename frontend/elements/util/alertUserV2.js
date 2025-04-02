import Swal from 'sweetalert2'
import { isHTML } from './utils'

export const alertUserV2 = (params) => {
  const {
    type, title, message, allowOutsideClick, allowEscapeKey, html,
    showConfirm, onConfirm, confirmButtonColor, confirmButtonText,
    showCancel, onCancel, cancelButtonColor, cancelButtonText,
    showDeny, onDeny, denyButtonColor, denyButtonText
  } = params

  Swal.fire({
    icon: type,
    title,
    text: message,
    allowOutsideClick: allowOutsideClick || false,
    allowEscapeKey: allowEscapeKey || true,
    html,
    showConfirmButton: showConfirm ?? true,
    confirmButtonText: confirmButtonText || 'OK',
    confirmButtonColor: confirmButtonColor || '#7cd1f9',
    showCancelButton: showCancel,
    cancelButtonText,
    cancelButtonColor,
    showDenyButton: showDeny,
    denyButtonText,
    denyButtonColor,
    heightAuto: false,
    reverseButtons: true
  }).then(value => {
    if (value.isConfirmed && onConfirm instanceof Function) {
      onConfirm()
    } else if (value.isDismissed && onCancel instanceof Function) {
      onCancel()
    } else if (value.isDenied && onDeny instanceof Function) {
      onDeny()
    }
  }).catch(err => {
    console.error(err)
  })
}

export const alertUserResponse = (params) => {
  const { response, type, onConfirm, confirmButtonColor } = params
  const status = response?.status || 500
  let alertType = type || response?.response?.data?.type?.toLowerCase() || response?.data?.type?.toLowerCase() || response?.type?.toLowerCase() || ''
  if (!alertType && status > 200) {
    alertType = 'error'
  }
  let title = response?.response?.data?.title || response?.data?.title || response?.title || response
  let message = response?.response?.data?.message || response?.data?.message || response?.message || ''
  const responseIsHtml = isHTML(response)
  if (responseIsHtml) {
    title = ''
    message = ''
  }
  Swal.fire({
    icon: alertType,
    title,
    text: message,
    html: responseIsHtml && response,
    allowOutsideClick: false,
    heightAuto: false,
    confirmButtonColor: confirmButtonColor || '#7cd1f9'
  }).then(value => {
    if (value.isConfirmed && onConfirm instanceof Function) {
      onConfirm()
    }
  })
}
