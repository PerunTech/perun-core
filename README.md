# Perun.js
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![build status](https://gitlab.prtech.mk/prtech/moemris_perun/badges/branch_merge/build.svg)](https://gitlab.prtech.mk/prtech/moemris_perun/commits/branch_merge)

### Redux state, actions and reducers Info

* Almost all code in backend directory will be removed 
* Only one function will be used for dispatching data [dataToRedux.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/dataToRedux.js).
* No need to create complex reducers, now dispatch sends to specified reducer and redux key.

#### Usage:
First do ```npm install``` or ```yarn install```. Then read comments in [dataToRedux.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/dataToRedux.js), 
[Reducers.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/Reducers.js) and [utils.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/utils.js). 
Usage is very simple.
* Create a reducer if needed [Reducers.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/Reducers.js)

    ```js
    import createReducer from 'redux-updeep'
    ...
    export let security = createReducer('security', 'nullOrInitialValue') // namespace here is security
    ...
    ```
    (note second argument is initial state (undefined) and third is some complex transformation, 
    check [dataToRedux.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/dataToRedux.js) for more info.)
* Import namespace to [index.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/reducers/index.js)
    ```js
    import {security, grid} from '../Reducers.js'
    ...
    const appReducer = combineReducers({
        security: security, // thats it, nothing more

    })
    ...
    ```
* Dispatch to get REST data like this:
    ```js
    import store from './backend/store'
    import {dataToRedux} from './backend/dataToRedux.js'
    ...
    store.dispatch(dataToRedux((response) => console.log(response), 'security', 'svSession', 'MAIN_LOGIN', "someUserName", "somePassword")))
    ...
    ```
    1. When using to get REST data, first argument is a callback or null. You can get REST response right away and do something when done. 
       In case of error callback wont be executed and error will be sent to a redux key except if a complex transformation is present in
       the create reducer function in [Reducers.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/Reducers.js). 
       Also see [utils.js](https://gitlab.prtech.mk/prtech/moemris_perun/blob/dev/PERUNJS/js/backend/utils.js)
       for and example.
       This fixes async problems when concurrent dispatches are needed, so basically now you can nest dispatches.
    2. Second argument is the reducer for whom the data is meant.
    3. Third argument is the redux key in which the data will live.
    4. Forth argument can be a verb or pure data:
        * Verbs exist in the ```config.js``` file under ```triglavRestVerbs: {}```. No more nested verbs. Verbs also need to be descriptive and be named by
        the application in which they belong.
        * If forth argument is pure data, data will show straight away in redux. Callbacks wont be executed if present and 5th+ argument wont do anything. Usage:
            ```js
            import {dataToRedux} from './dataToRedux.js'

            store.dispatch(null, 'someReducer', 'someReducerKey', "someDataStringObjectOrArray")))

            ```
    5. Fifth argument and onwards are only available for REST data parameters of verbs


### Git; Branch and Stability Info
Source control is `Git` exclusive:

* The `master` branch is updated only from the current state of the `staging` branch
* The `staging` branch must only be updated with commits from the `dev` branch
* The `dev` branch contains all the latest additions to the project
* All larger feature updates must be developed in their own branch and later merged into `dev`

### Dev guide
1. Install [ATOM] (https://atom.io/)
2. Install [NODE.js] (https://nodejs.org/en/)
3. Install [GIT BASH] (https://git-for-windows.github.io/)
4. Install JSX syntax highlighting for ATOM.
  - Open GIT BASH and run:
```
  apm install react
```
5. Clone this repo:
  - Open GIT BASH and run:
```
  git clone https://gitlab.prtech.mk/prtech/moemris_perun
```
6. Open directory in ATOM:
  - Open GIT BASH and run:
```
  cd moemris_perun
  atom .
```
7. Install NPM modules defined in package.json.
  - Open GIT BASH and run (in moemris_perun directory):
```
  npm install
```
NOTE: you can always rm -rf node_modules and run npm install again.
8. Run webpack JS compiler. See package.json. This also acts as a webserver. Check localhost:8080
  - In GIT BASH and run:
```
  npm run dev
```
NOTE: webpack automatically compiles changes made in .js files to ./src/client.min.js, and automatically reloads changes in browser (localhost:8080)


##To hide client.min.js from tree view:

1. From the Menu Bar go to File > Settings > Packages type in the Filter "tree-view" click on the setting of this package and then check the "Hide Ignored Names" choice.

2. Now go to "Core Setting" by File > Settings . In the Ignored Names box enter "client.min.js" this will Hide client.min.js.



### Enable cross domain for development access to triglav_rest api
##### It can be done in two ways:
1. Install [Chrome extension Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en)
OR
2. Run Chrome with ```"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\TEMP"```

## Using strings in components:

##### Just render text in elements
```js
import { FormattedMessage, defineMessages } from 'react-intl';
...
  render() {
    return (
      <div>
          <FormattedMessage
            id="perun.login.login_message"
            defaultMessage="perun.login.login_message"
            description="perun.login.login_message"
          />
        </Link>
      </div>
    );
  }
...
```
##### Use strings inbetween tags

```js
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';

export default class LoginForm extends React.Component {

  render() {

    return (
      <div>
        <input type="text"
          id="tb_idbr"
          className="tb_idbr"
          placeholder={this.context.intl.formatMessage({id:"perun.login.user_name", defaultMessage: "perun.login.user_name"})}
          style={{height: 30}}
        />
      </div>
    );
  }
}


LoginForm.contextTypes ={
 intl:React.PropTypes.object.isRequired
}


```


###### Long way, but extracts messages
```js
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';

let messages = defineMessages({
    user_name: {
        id: 'perun.login_user_name',
        defaultMessage: 'perun.login_user_name',
        description: 'perun.login.user_name',
    },
});

class LoginForm extends React.Component {

  render() {
    const {formatMessage} = this.props.intl;

    return (
        <div>
            <input type="text"
                id="tb_idbr"
                className="tb_idbr"
                placeholder={formatMessage(messages.user_name)}
                style={{height: 30}}
            />
        </div
    );
  }
}

LoginForm.propTypes = {
    intl: intlShape.isRequired,
};

export default injectIntl(LoginForm);
```

###### Shorter way to use strings in tags, but does not extract messages
```js
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';

let messages = defineMessages({});

function testFunction (id, key){
  messages[id] = {
    "id": [key].toString(),
    "defaultMessage": [key].toString(),
    "description": [key].toString()
  };
};

testFunction("user_name", "perun.login.user_name");
testFunction("password", "perun.login.password");

class LoginForm extends React.Component {

  render() {
    const {formatMessage} = this.props.intl;

    return (
        <div>
            <input type="text"
                id="tb_idbr"
                className="tb_idbr"
                placeholder={formatMessage(messages.user_name)}
                style={{height: 30}}
            />
        </div
    );
  }
}

LoginForm.propTypes = {
    intl: intlShape.isRequired,
};

export default injectIntl(LoginForm);
```


## Links worth reading:

http://stackoverflow.com/questions/31709258/why-is-getinitialstate-not-being-called-for-my-react-class

https://toddmotto.com/react-create-class-versus-component/

#### how to use react classes
https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4#.behdtz7uv


#### async wait for redux react
http://jsbin.com/xopumutiwu/edit?js,output


#### redux react auth
https://auth0.com/blog/secure-your-react-and-redux-app-with-jwt-authentication/
http://www.thegreatcodeadventure.com/jwt-authentication-with-react-redux/
http://blog.slatepeak.com/build-a-react-redux-app-with-json-web-token-jwt-authentication/


#### proper use of connect es6
https://medium.com/@firasd/quick-start-tutorial-using-redux-in-react-apps-89b142d6c5c1#.k9t6bpkwl
##### map state to props, map dispatch to props
http://stackoverflow.com/questions/38202572/understanding-react-redux-and-mapstatetoprops
https://github.com/reactjs/react-redux/issues/291


#### timeout redux with callbacks and stuff (for science only)
http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559


#### "proper" folder structure react
https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.1aa2js7lf


#### react-tooltip demo
http://wwayne.com/react-tooltip/
##### html built in events for react-tooltip (use without the "on" in front of events i.e click instead of onclick)
http://www.w3schools.com/tags/ref_eventattributes.asp


#### react component lifecycle (getInitialState is deprecated )
http://busypeoples.github.io/post/react-component-lifecycle/
https://plnkr.co/edit/0cN0tu?p=preview
https://codepen.io/netsi1964/pen/NRgyZX


#### react HOC vodoo
https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.p44gmavrt
