/* global firebase: true */

import { createAction } from 'redux-actions';

import moment from 'moment';

import * as UserAPI from 'common/api/user';
import { backToWeb } from 'common/utils';
import { APIHandler } from 'common/utils/api';
import {
  clearLocalItems,
  getAuthItem,
  redirectToLoginPage,
  setLocalUserItem,
} from 'common/utils/auth';
import { clearLastEditingOice } from 'common/utils/editor';
import i18next, { mapLanguageCode } from 'common/utils/i18n';
import * as IntercomUtils from 'common/utils/intercom';


export const updateUser = createAction('UPDATED_USER');

export const willLogin = createAction('USER_WILL_LOGIN');
export const loginWithGoogle = (firebaseUser, googleToken) => async (dispatch, getState) => {
  if (getState().user.isLoggingIn) {
    return undefined;
  }
  dispatch(willLogin());
  try {
    const firebaseToken = await firebaseUser.getIdToken(true);
    const user = await APIHandler(
      dispatch, UserAPI.loginWithGoogle(firebaseUser, firebaseToken, googleToken)
    );
    setLocalUserItem(user);

    // synchronize language with server
    moment.locale(user.uiLanguage);
    if (mapLanguageCode(i18next.language) !== user.uiLanguage) {
      i18next.changeLanguage(user.uiLanguage);
    }

    IntercomUtils.updateWithUser(user);

    dispatch(updateUser(user));
    return user;
  } catch (error) {
    console.info(error);
    return undefined;
  }
};


export const authenticate = () => (dispatch, getState) => {
  firebase.auth().onAuthStateChanged((firebaseUser) => {
    const { isLoggingIn, isAuthenticated } = getState().user;
    if (!(isLoggingIn || isAuthenticated)) {
      if (firebaseUser) {
        dispatch(loginWithGoogle(firebaseUser));
      } else {
        dispatch(updateUser());
      }
    }
  });
};


export const signOut = () => dispatch => APIHandler(dispatch,
  UserAPI.signOut()
  .then((message) => {
    if (firebase.auth().currentUser || getAuthItem()) {
      firebase.auth().signOut().then(() => {
        IntercomUtils.shutdown();
        clearLocalItems();
        clearLastEditingOice();
        backToWeb();
      });
    }
  })
);
