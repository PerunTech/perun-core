import React from 'react'
import { Configurator } from '../../loadConfiguration/Configurator'
import LoginForm from './presentational/LoginForm'
import RegistrationForm from './presentational/RegistrationForm'
import RecoverPassword from './presentational/RecoverPassword'
import ChangeEmail from './presentational/ChangeEmail'
import ChangePassword from './composite/ChangePassword'
import ActivateUser from './composite/ActivateUser'
import ActivationEmail from './presentational/ActivationEmail';
import Announcements from './presentational/Announcements';
import RegistrationSso from './presentational/RegisterSSo/RegistrationSso'

const Logon = ({ match }) => {
  switch (match.params.logonComp) {
    case 'login': {
      return <Configurator key='Configurator' type='LOGIN'>
        <LoginForm key='LoginForm' />
      </Configurator>
    }
    case 'register': {
      return <Configurator key='Configurator' type='LOGIN'>
        <RegistrationForm key='RegistrationForm' />
      </Configurator>
    }
    case 'recov_pass': {
      return <Configurator key='Configurator' type='LOGIN'>
        <RecoverPassword key='RecoverPassword' />
      </Configurator>
    }
    case 'change_pass': {
      return <Configurator key='Configurator' type='LOGIN'>
        <ChangePassword key='ChangePassword' />
      </Configurator>
    }
    case 'change_pass_internal': {
      return <Configurator key='Configurator' type='LOGIN'>
        <ChangePassword key='ChangePassword' />
      </Configurator>
    }
    case 'change_email': {
      return <Configurator key='Configurator' type='LOGIN'>
        <ChangeEmail key='ChangeEmail' />
      </Configurator>
    }
    case 'activate': {
      return <Configurator key='Configurator' type='LOGIN'>
        <ActivateUser key='ActivateUser' />
      </Configurator>
    }
    case 'activate_link': {
      return <Configurator key='Configurator' type='LOGIN'>
        <ActivationEmail key='ActivationEmail' />
      </Configurator>
    }
    case 'ann': {
      return <Configurator key='Configurator' type='LOGIN'>
        <Announcements key='Announcement' />
      </Configurator>
    }
    case 'register_sso': {
      return <Configurator key='Configurator' type='LOGIN'>
        <RegistrationSso key='RegistrationSso' />
      </Configurator>
    }
    default: {
      return null
    }
  }
}

export default Logon
