import { applyMiddleware, createStore, combineReducers } from 'redux';
import { browserHistory } from 'react-router';
import promiseMiddleware from 'redux-promise';
import { routerReducer, routerMiddleware } from 'react-router-redux';

// Middlewares
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import * as reducers from 'editor/reducers/';

const combinedReducers = combineReducers({
  ...reducers,
  routing: routerReducer,
});

const middleware = applyMiddleware(
  routerMiddleware(browserHistory),
  thunk,
  promiseMiddleware,
  logger(),
);

export default createStore(combinedReducers, middleware);
