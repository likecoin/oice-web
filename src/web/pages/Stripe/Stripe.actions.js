import { createAction } from 'redux-actions';
import { replace } from 'react-router-redux';
import { APIHandler } from 'common/utils/api';

import * as UserAPI from 'common/api/user';
import { DOMAIN_URL } from 'common/constants';


function goToUrl(url) {
  window.location.href = url ? `/${url}` : '/';
}

export const connectStripe = (code, redirectUrl) => (dispatch) => {
  APIHandler(
    dispatch,
    UserAPI.connectStripe({ code })
      .then((response) => {
        goToUrl(redirectUrl);
      })
  );
};

export const disconnectStripe = redirectUrl => (dispatch) => {
  APIHandler(
    dispatch,
    UserAPI.disconnectStripe()
      .then((response) => {
        goToUrl(redirectUrl);
      })
  );
};
