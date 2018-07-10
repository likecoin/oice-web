import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import * as Actions from './OiceSingleView.actions';

// Reducers
const initialState = {
  oice: null,
  credits: null,
  sms: {
    countries: [],
    sendingSMS: false,
    sentSMS: false,
    userCountryCode: undefined,
  },
  relatedOices: [],
};

export default handleActions({
  [Actions.fetchedOiceInfo]: (state, { payload }) => ({
    ...state,
    oice: payload,
  }),
  [Actions.fetchedOiceCredits]: (state, { payload }) => ({
    ...state,
    credits: payload,
  }),
  [Actions.incrementedOiceViewCount]: (state, { payload }) => ({
    ...state,
  }),
  [Actions.fetchedCountriesJson]: (state, { payload }) => (
    update(state, {
      sms: { countries: { $set: payload } },
    })
  ),
  [Actions.resetSMS]: state => update(state, {
    sms: {
      sendingSMS: { $set: false },
      sentSMS: { $set: false },
    },
  }),
  [Actions.willSendSMS]: state => update(state, {
    sms: { sendingSMS: { $set: true } },
  }),
  [Actions.didSendSMS]: state => update(state, {
    sms: {
      sentSMS: { $set: true },
      sendingSMS: { $set: false },
    },
  }),
  [Actions.fetchUserCountryCodeEnd]: (state, { payload }) => update(state, {
    sms: {
      userCountryCode: { $set: payload },
    },
  }),
  [Actions.fetchedRelatedOices]: (state, { payload }) => update(state, {
    relatedOices: { $set: payload },
  }),
}, initialState);
