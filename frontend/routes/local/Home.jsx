import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import { svSessionRegxp } from '../../model';
import { Loading } from '../../components/ComponentsIndex';
import LandingContainer from '../../containers/Landing'

const UserIsAuthenticatedSoNeverEnter = connectedRouterRedirect({
    redirectPath: () => '/main',
    allowRedirectBack: false,
    authenticatedSelector: state => !svSessionRegxp(state.security.svSession),
    authenticatingSelector: state => state.security.isBusy,
    wrapperDisplayName: 'UserIsAuthenticatedSoNeverEnter',
    AuthenticatingComponent: Loading
})
const Landing = UserIsAuthenticatedSoNeverEnter(LandingContainer);

{/* Landing with subroutes */ }
export const Home = {
    path: '/home',
    render: Landing,
    isExact: false
};