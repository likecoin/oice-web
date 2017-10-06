import * as LogAPI from 'common/api/log';

import { isMobileAgent } from 'common/utils';
import { APIHandler } from 'common/utils/api';

const getPathChannel = () => {
  if (/about\.*/.test(window.location.pathname)) {
    return 'homepage';
  } else if (/story\/\.*/.test(window.location.pathname)) {
    return 'singleview';
  }
  return 'other';
};

export const logClickWeb = (actionTrigger, payload = {}) => async (dispatch) => {
  await APIHandler(dispatch, LogAPI.log({
    name: 'logClickWeb',
    data: {
      channel: getPathChannel(),
      referrer: document.referrer,
      url: window.location.href,
      uuid: payload.oiceUuid,
      actionTrigger,
    },
  }));
};

export const logReadOice = oiceUuid => async (dispatch) => {
  await APIHandler(dispatch, LogAPI.log({
    name: 'logReadOice',
    data: {
      channel: getPathChannel(),
      referrer: document.referrer,
      url: window.location.href,
      uuid: oiceUuid,
    },
  }));
};

export const logOiceWebAcquisition = (payload = {}) => async (dispatch) => {
  const referrer = document.referrer;
  const name = referrer.includes(window.location.hostname) ? 'logOiceWebBehaviour' : 'logOiceWebAcquisition';
  await APIHandler(dispatch, LogAPI.log({
    name,
    data: {
      channel: isMobileAgent() ? 'deepview' : getPathChannel(),
      referrer: document.referrer,
      url: window.location.href,
      uuid: payload.oiceUuid,
    },
  }));
};
