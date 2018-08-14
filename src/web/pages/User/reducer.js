import { handleActions } from 'redux-actions';

import update from 'immutability-helper';

import * as Actions from './actions';


const initialState = {
  credits: [],
  libraries: [],
  loaded: false,
  loading: false,
  stats: undefined,
  stories: [],
  oices: [],
  links: [],
  user: undefined,
};

export default handleActions({
  [Actions.fetchUserProfileBegin]: (state, { payload }) => ({
    ...state,
    loading: true,
  }),
  [Actions.fetchUserProfileEnd]: (state, { payload }) => ({
    ...state,
    ...payload,
  }),
  [Actions.fetchUserProfileDetailsEnd]: (state, { payload }) => ({
    ...state,
    ...payload,
    loaded: true,
    loading: false,
  }),
  [Actions.fetchOicesFromStoryBegin]: state => update(state, { oices: { $set: [] } }),
  [Actions.fetchOicesFromStoryEnd]: (state, { payload }) => ({
    ...state,
    oices: payload,
  }),
  [Actions.closeOiceList]: (state, { payload }) => ({
    ...state,
    oices: [],
  }),
  [Actions.fetchUserLinksEnd]: (state, { payload }) => (
    update(state, {
      links: { $set: payload.links },
    })
  ),
}, initialState);
