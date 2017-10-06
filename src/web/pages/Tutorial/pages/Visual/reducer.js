import { handleActions } from 'redux-actions';

import {
  fetchTutorialOicesBegin,
  fetchTutorialOicesEnd,
} from './actions';

const initialState = {
  oices: [],
  loading: false,
};

export default handleActions({
  [fetchTutorialOicesBegin]: (state) => ({
    ...state,
    loading: true,
  }),
  [fetchTutorialOicesEnd]: (state, { payload }) => ({
    ...state,
    loading: false,
    oices: payload,
  }),
}, initialState);
