import { handleAction, handleActions } from 'redux-actions';

import {
  APP_ERROR,
  APP_LOGIN,
  APP_LOGIN_ERROR,
  APP_LOGOUT,
  TOGGLE_PROGRESS_HUD,
} from 'editor/constants/actionTypes';

const initialState = {
  loggedIn: false,
  loginError: null,
  loading: false,
};

export default handleActions({
  APP_ERROR: (state, { payload }) => ({
    ...state,
    error: payload,
  }),
  APP_LOGIN: state => ({
    ...state,
    loggedIn: true,
    loginError: null,
  }),
  APP_LOGIN_ERROR: (state, { payload }) => ({
    ...state,
    loginError: payload,
  }),
  APP_LOGOUT: state => ({
    ...state,
    loggedIn: false,
  }),
  TOGGLE_PROGRESS_HUD: (state, { payload = true }) => ({
    ...state,
    loading: payload,
  }),
}, initialState);
