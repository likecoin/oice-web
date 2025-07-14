import { createAction } from 'redux-actions';

import moment from 'moment';

import * as UserAPI from 'common/api/user';
import { backToWeb } from 'common/utils';
import { APIHandler } from 'common/utils/api';
import firebase from 'common/utils/firebase';
import {
  clearLocalItems,
  getAuthItem,
  redirectToLoginPage,
  setLocalUserItem,
} from 'common/utils/auth';
import { clearLastEditingOice } from 'common/utils/editor';
import i18next, { mapLanguageCode } from 'common/utils/i18n';
import { IS_DEV_MODE } from 'common/constants';


export const updateUser = createAction('UPDATED_USER');

export const willLogin = createAction('USER_WILL_LOGIN');
export const loginWithGoogle = (firebaseUser, googleToken) => async (dispatch, getState) => {
  if (getState().user.isLoggingIn) {
    return undefined;
  }
  dispatch(willLogin());
  try {
    const firebaseToken = IS_DEV_MODE ? '' : await firebaseUser.getIdToken(true);
    const user = await APIHandler(
      dispatch, UserAPI.loginWithGoogle(firebaseUser, firebaseToken, googleToken)
    );
    setLocalUserItem(user);

    // synchronize language with server
    moment.locale(user.uiLanguage);
    if (mapLanguageCode(i18next.language) !== user.uiLanguage) {
      i18next.changeLanguage(user.uiLanguage);
    }

    dispatch(updateUser(user));
    return user;
  } catch (error) {
    console.info(error);
    return undefined;
  }
};


export const authenticate = () => (dispatch, getState) => {
  if (!IS_DEV_MODE) {
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
  } else {
    dispatch(loginWithGoogle({
      providerData: [{
        email: 'oice-dev',
        displayName: 'oice-dev',
        photoURL: '',
        providerId: 'oice-dev',
      }],
    }, 'dev'));
  }
};


export const signOut = () => dispatch => APIHandler(dispatch,
  UserAPI.signOut()
    .then((message) => {
      if (firebase.auth().currentUser || getAuthItem()) {
        firebase.auth().signOut().then(() => {
          clearLocalItems();
          clearLastEditingOice();
          backToWeb();
        });
      }
    })
);

export const updateUserMeta = ({ meta, avatar }) => async (dispatch) => {
  const user = await APIHandler(dispatch, UserAPI.updateUser({
    avatar,
    meta: JSON.stringify(meta),
  }));
  dispatch(updateUser(user));

  return user;
};
