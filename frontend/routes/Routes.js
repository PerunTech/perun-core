import React, { Suspense } from 'react';
import { Router as ReactRouter, Switch, Redirect } from 'react-router-dom';
import createHashHistory from 'history/createHashHistory';
import { Loading, Footer, HomeMenu } from 'components/ComponentsIndex';
import { connect } from 'react-redux';

class Routes extends React.Component {
    render() {
        return <ReactRouter history={createHashHistory({ basename: '/' })} >
            <Suspense fallback={<Loading />}>
                {this.props.fetchingRoutes ? <Loading /> : (
                    <React.Fragment>
                        <HomeMenu />
                        <Switch>
                            <Redirect exact from='/' to='/home/login' /> {/* this can be moved to our Home route, on top. */}
                            {/* ------------------------------------------------------------------------------ */}
                            {/* Render all routes currently registered with our Router. */}
                            {Object.values(this.props.routes).map(route => route)}
                            {/* ------------------------------------------------------------------------------ */}
                            <Redirect exact from='*' to='/404' />
                        </Switch>
                        <Footer />
                    </React.Fragment>
                )}
            </Suspense>
        </ReactRouter>
    }
}

export default connect(state => ({
    routes: state.routes,
    fetchingRoutes: state.routes.loading,
}))(Routes);