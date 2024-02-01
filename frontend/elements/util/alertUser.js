import swal from 'sweetalert';

// sweetalert-react package is simply a react wrapper for sweetalert package
// at the time of writing sweetalert-react is outated and does not handle multiple
// alerts very well and alerts get stuck. Since sweetalert is not based on react
// it just makes problems.
// read documentation at https://sweetalert.js.org

/**
  A simple alerting function which renders an alert/prompt on the client side.
  Renders a React element in the DOM, which means that the function output
  DOES NOT HAVE TO BE RENDERED in the React Component. No problems arise if
  it is, however.
* MANDATORY PARAMETERS
* @param {boolean} show - renders an alert if true, removes existing alerts if false
* @param {string} type - displays an image depending on one of the following alert types: success, error, warning, info
* @param {string} title - main title/text of the alert body
*
* OPTIONAL PARAMETERS
* @param {string} text - message in the alert body - goes below the text with a smaller font
* @param {function} onConfirm - a function which is invoked when the user clicks on the alert confirmation button - if no function is passed as a parameter, the default function only closes the alert
* @param {function} onCancel - a function which is invoked when the user clicks on the alert cancel button
* @param {boolean} showCancelButton - renders the cancel button if true
* @param {string} confirmButtonText - replaces the default "OK" confirm button text with the one passed in this parameter
* @param {string} cancelButtonText - replaces the default "Cancel" cancel button text with the one passed in this parameter
* @param {boolean} showLoaderOnConfirm - display a loader in the confirm button if that button is clicked
* @param {string} confirmButtonColor - replaces the default confirm button color with the one passed as a parameter
* @param {boolean} disableOutsideClick - closes the alert when clicking outside of it if true
* @param {object} content - renders a custom component in the alert
* @param {boolean} buttonsFlag - when true hides all buttons in the alert
*/

export function alertUser (
  show, type, title, text, onConfirm, onCancel, showCancelButton,
  confirmButtonText, cancelButtonText, showLoaderOnConfirm, confirmButtonColor, disableOutsideClick, content, buttonsFlag
) {
  function alertWithoutReact () {
    show && swal({
      title,
      text,
      icon: type,
      buttons: buttonsFlag ? false : {
        ...showCancelButton && {cancel: cancelButtonText},
        confirm: confirmButtonText || 'OK'
      },
      dangerMode: type === 'warning',
      closeOnClickOutside: false,
      content
    }).then((value) => {
      if (value && onConfirm instanceof Function) {
        onConfirm()
      } else if (!value && onCancel instanceof Function) {
        onCancel()
      }
    })
  }

  return alertWithoutReact()
}
