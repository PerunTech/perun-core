import isEmpty from 'lodash/isEmpty'
import validator from 'validator'

function passwordStrengthTest(string) {
  if (!string.match(/\d/)) {
    return 'perun.login.password.digit_check'
  } else return null
}

/* form validator send: data and type of form, return error message */
export default function validateInput(data, type) {
  const errors = {}
  switch (type) {
    case 'LOGIN':
      {
        if (validator.isEmpty(data.username)) {
          // use id key label from database
          errors.username = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.username)) {
          // use id key label from database
          errors.username = 'perun.login.mandatory_asci'
        }
        if (validator.isEmpty(data.password)) {
          errors.password = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.password)) {
          errors.password = 'perun.login.mandatory_asci'
        }
        break
      }
    case 'REGISTER':
      {
        // password check
        if (validator.isEmpty(data.password)) {
          errors.password = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.password)) {
          errors.password = 'perun.login.mandatory_asci'
        } else if (!validator.isLength(data.password, {
          min: 8
        })) {
          errors.password = 'perun.login.mandatory_min_length'
        } else if (data.password !== data.repeatPassword) {
          errors.password = 'perun.login.mandatory_pass_check'
        }
        const passErr = passwordStrengthTest(data.password)
        if (passErr) {
          errors.password = passErr
        }
        // password check
        if (validator.isEmpty(data.repeatPassword)) {
          errors.repeatPassword = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.repeatPassword)) {
          errors.repeatPassword = 'perun.login.mandatory_asci'
        } else if (!validator.isLength(data.repeatPassword, {
          min: 8
        })) {
          errors.repeatPassword = 'perun.login.mandatory_min_length'
        } else if (data.password !== data.repeatPassword) {
          errors.repeatPassword = 'perun.login.mandatory_pass_check'
        }
        const repPassErr = passwordStrengthTest(data.repeatPassword)
        if (repPassErr) {
          errors.repeatPassword = repPassErr
        }
        // username check
        if (validator.isEmpty(data.username)) {
          errors.username = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.username)) {
          errors.username = 'perun.login.mandatory_asci'
        }
        // eMail check
        if (validator.isEmpty(data.eMail)) {
          errors.eMail = 'perun.login.mandatory_login_empty'
        } else if (!validator.isEmail(data.eMail)) {
          errors.eMail = 'perun.login.mandatory_email_check'
        } else if (!validator.isAscii(data.eMail)) {
          errors.eMail = 'perun.login.mandatory_asci'
        }
        // idNo check
        if (validator.isEmpty(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_asci'
        } else if (!validator.isInt(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        } else if (!validator.isLength(data.idNo, { min: 13, max: 13 })) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        }
        break
      }
    case 'RECOVER_PASS':
      {
        if (validator.isEmpty(data.username)) {
          errors.username = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.username)) {
          errors.username = 'perun.login.mandatory_asci'
        }
        break
      }
    case 'CHANGE_PASS':
      {
        if (validator.isEmpty(data.username)) {
          errors.username = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.username)) {
          errors.username = 'perun.login.mandatory_asci'
        }
        // idNo check
        if (validator.isEmpty(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_asci'
        } else if (!validator.isInt(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        } else if (!validator.isLength(data.idNo, { min: 13, max: 13 })) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        }
        // PASSWORD check
        if (validator.isEmpty(data.password)) {
          errors.password = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.password)) {
          errors.password = 'perun.login.mandatory_asci'
        } else if (!validator.isLength(data.password, {
          min: 8
        })) {
          errors.password = 'perun.login.mandatory_min_length'
        }
        const passErr = passwordStrengthTest(data.password)
        if (passErr) {
          errors.password = passErr
        }
        // PASSWORD check
        if (validator.isEmpty(data.repeatPassword)) {
          errors.repeatPassword = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.repeatPassword)) {
          errors.repeatPassword = 'perun.login.mandatory_asci'
        } else if (!validator.isLength(data.repeatPassword, {
          min: 8
        })) {
          errors.repeatPassword = 'perun.login.mandatory_min_length'
        }
        const repPassErr = passwordStrengthTest(data.repeatPassword)
        if (repPassErr) {
          errors.repeatPassword = repPassErr
        }
        if (data.password !== data.repeatPassword) {
          errors.repeatPassword = 'perun.login.mandatory_pass_check'
          errors.password = 'perun.login.mandatory_pass_check'
        }
        break
      }
    case 'CHANGE_EMAIL':
      {
        // username check
        if (validator.isEmpty(data.username)) {
          errors.username = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.username)) {
          errors.username = 'perun.login.mandatory_asci'
        }
        // eMail check
        if (validator.isEmpty(data.eMail)) {
          errors.eMail = 'perun.login.mandatory_login_empty'
        } else if (!validator.isEmail(data.eMail)) {
          errors.eMail = 'perun.login.mandatory_email_check'
        } else if (!validator.isAscii(data.eMail)) {
          errors.eMail = 'perun.login.mandatory_asci'
        }
        // idNo check
        if (validator.isEmpty(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_asci'
        } else if (!validator.isInt(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        } else if (!validator.isLength(data.idNo, { min: 7, max: 13 })) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        }
        break
      }
    case 'ACTIVATION_LINK_FORM':
      {
        // username check
        if (validator.isEmpty(data.username)) {
          errors.username = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.username)) {
          errors.username = 'perun.login.mandatory_asci'
        }
        // idNo check
        if (validator.isEmpty(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_asci'
        } else if (!validator.isInt(data.idNo)) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        } else if (!validator.isLength(data.idNo, { min: 7, max: 13 })) {
          errors.idNo = 'perun.login.mandatory_pin_check'
        }
        // PASSWORD check
        if (validator.isEmpty(data.password)) {
          errors.password = 'perun.login.mandatory_login_empty'
        } else if (!validator.isAscii(data.password)) {
          errors.password = 'perun.login.mandatory_asci'
        } else if (!validator.isLength(data.password, {
          min: 8
        })) {
          errors.password = 'perun.login.mandatory_min_length'
        }
        const passErr = passwordStrengthTest(data.password)
        if (passErr) {
          errors.password = passErr
        }
        break
      }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
