import { connect } from 'react-redux'
import { store, loginUser, registerUser, recoverPassword,
  changePassword, changeEmail, activateUser, activateLink } from '../../../model';

export default function LogonActions (targetComponent) {
  const mapDispatchToProps = () => ({
    loginUser: (restUrl, method, formData) =>
      store.dispatch(loginUser(restUrl, method, formData)),
    registerUser: (restUrl, method, formData) =>
      store.dispatch(registerUser(restUrl, method, formData)),
    recoverPassword: (restUrl, method, formData) =>
      store.dispatch(recoverPassword(restUrl, method, formData)),
    changePassword: (restUrl, method, formData) =>
      store.dispatch(changePassword(restUrl, method, formData)),
    changeEmail: (restUrl, method, formData) =>
      store.dispatch(changeEmail(restUrl, method, formData)),
    activateUser: (restUrl, method, formData) =>
      store.dispatch(activateUser(restUrl, method, formData)),
    activateLink: (restUrl, method, formData) =>
      store.dispatch(activateLink(restUrl, method, formData))
  })

  const mapStateToProps = state => ({
    isBusy: state.security.isBusy,
    svSession: state.security.svSession,
    svTitle: state.security.svTitle,
    svMessage: state.security.svMessage,
    status: state.security.status
  })

  return connect(mapStateToProps, mapDispatchToProps)(targetComponent)
}
