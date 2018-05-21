import { handleActions } from 'redux-actions';

import * as actions from './ItemModal.actions';

const initialState = {
  open: false,
  item: null,
  loading: false,
};

export default handleActions({
  [actions.toggle]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    item: payload.open ? payload.asset : null,
  }),
  [actions.willAdd]: state => ({
    ...state,
    loading: true,
  }),
  [actions.didAdd]: (state, { payload }) => ({
    ...state,
    open: false,
    loading: false,
  }),
  [actions.willUpdate]: state => ({
    ...state,
    loading: true,
  }),
  [actions.didUpdate]: (state, { payload }) => ({
    ...state,
    open: false,
    item: payload,
    loading: false,
  }),
  [actions.willDelete]: state => ({
    ...state,
    loading: true,
  }),
  [actions.didDelete]: (state, { payload }) => ({
    ...state,
    open: false,
    loading: false,
  }),
}, initialState);
