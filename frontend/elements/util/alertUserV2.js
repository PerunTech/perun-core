import Swal from 'sweetalert2'

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
    heightAuto: false
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
  const { response, type, onConfirm } = params
  const alertType = type || response?.type?.toLowerCase() || response?.data?.type?.toLowerCase() || ''
  const title = response?.title || response?.data?.title || response
  const message = response?.message || response?.data?.message || ''
  Swal.fire({
    icon: alertType,
    title,
    text: message,
    allowOutsideClick: false,
    heightAuto: false,
    confirmButtonColor: '#7cd1f9'
  }).then(value => {
    if (value.isConfirmed && onConfirm instanceof Function) {
      onConfirm()
    }
  })
}
