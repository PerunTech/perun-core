import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import Form from '@rjsf/core'
import { Loading } from '../ComponentsIndex'
import { alertUser } from '../../elements'
import { getUserFormSchema } from './utils/usersFormSchema'
import md5 from 'md5'
import validator from '@rjsf/validator-ajv8';
const UserForm = (props, context) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({})
  const { schema, uiSchema } = getUserFormSchema(context)

  const onChange = (e) => {
    setFormData(e.formData)
  }

  const onSubmit = (e) => {
    setLoading(true)
    const { svSession } = props
    const url = `${window.server}/WsAdminConsole/saveUser/${svSession}`
    const formData = { ...e.formData }
    if (formData.userPassword && formData.confUserPassword) {
      formData.userPassword = md5(formData.userPassword)
      formData.confUserPassword = md5(formData.confUserPassword)
    }
    const data = JSON.stringify(formData)
    axios({
      method: 'post',
      data,
      url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(response => {
      if (response.data) {
        setLoading(false)
        const responseType = response.data?.type?.toLowerCase() || 'info'
        const message = response.data.message
        alertUser(true, responseType, message)
        if (responseType === 'success') {
          setFormData({})
        }
      }
    }).catch(error => {
      setLoading(false)
      alertUser(true, 'error', error)
    })
  }

  return (
    <React.Fragment>
      {loading && <Loading />}
      <div className='admin-console-user-form-container'>
        <Form validator={validator} schema={schema} uiSchema={uiSchema} formData={formData} className='user-form-container' onSubmit={onSubmit} onChange={onChange}>
          <></>
          <div id='buttonHolder'>
            <div id='btnSeparator' className='userFormBtn'>
              <button type='submit' id='save_form_btn' className='btn-success btn_save_form'>{context.intl.formatMessage({ id: 'perun.adminConsole.save', defaultMessage: 'perun.adminConsole.save' })}</button>
            </div>
          </div>
        </Form>
      </div>
    </React.Fragment>
  )
}

UserForm.contextTypes = {
  intl: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

export default connect(mapStateToProps)(UserForm)
