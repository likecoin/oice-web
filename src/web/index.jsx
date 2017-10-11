import { createHistory } from 'history';

import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';

import useRouterHistory from 'react-router/lib/useRouterHistory';
import { I18nextProvider } from 'react-i18next';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Redux
import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import {
  routerReducer,
  routerMiddleware,
  syncHistoryWithStore,
} from 'react-router-redux';

import i18n from 'common/utils/i18n';
import * as FirebaseUtils from 'common/utils/firebase';

// Middlewares
import promiseMiddleware from 'redux-promise';
import thunkMiddleware from 'redux-thunk';

import routes from './routes';
import * as reducers from './reducers.js';


const DEBUG = process.env.NODE_ENV !== 'production';

const history = useRouterHistory(createHistory)();

// Redux Store
const combinedReducers = combineReducers({
  ...reducers,
  routing: routerReducer,
});

// Middlewares
const middleware = [
  routerMiddleware(history),
  thunkMiddleware,
  promiseMiddleware,
];

if (DEBUG) {
  const loggerMiddleware = require('redux-logger'); // eslint-disable-line global-require
  middleware.push(loggerMiddleware());
}

const store = createStore(combinedReducers, applyMiddleware(...middleware));

FirebaseUtils.init();

render((
  <MuiThemeProvider>
    <ReduxProvider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router
          history={syncHistoryWithStore(history, store)}
          routes={routes}
        />
      </I18nextProvider>
    </ReduxProvider>
  </MuiThemeProvider>
), document.getElementById('app'));

if (module.hot) {
  module.hot.accept();
}
