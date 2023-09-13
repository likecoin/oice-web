import { APIHandler } from 'common/utils/api';

import * as UserAPI from 'common/api/user';


function goToUrl(url) {
  window.location.href = url ? `/${url}` : '/';
}

export const connectStripeConnect = () => dispatch =>
  APIHandler(
    dispatch,
    UserAPI.connectStripeConnect()
      .then((url) => {
        if (url) window.location.href = url;
      })
  );

export const goToStripeConnectDashboard = () => dispatch =>
  APIHandler(
    dispatch,
    UserAPI.fetchStripeConnectDashboard()
      .then((url) => {
        if (url) window.location.href = url;
      })
  );

