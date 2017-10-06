import { handleActions } from 'redux-actions';

import {
  getUpdatedAssetsList,
} from './utils';

// Reducers
const initialState = {
  sync: false,
  backgrounds: [],
};

export default handleActions({
  FETCH_LIBRARY_BACKGROUNDS: (state, { payload }) => ({
    ...state,
    sync: true,
    backgrounds: payload,
  }),
  ADD_BACKGROUND: (state, { payload }) => ({
    ...state,
    sync: true,
    backgrounds: [...state.backgrounds, payload],
  }),
  UPDATE_BACKGROUND: (state, { payload }) => ({
    ...state,
    sync: true,
    backgrounds: getUpdatedAssetsList(state.backgrounds, payload),
  }),
  DELETE_BACKGROUND: (state, { payload }) => ({
    ...state,
    sync: true,
    backgrounds: getUpdatedAssetsList(state.backgrounds, payload),
  }),
  DESELECT_LIBRARY: () => initialState,
}, initialState);
