import { handleActions } from 'redux-actions';

import * as actions from './BackgroundModal.actions';

const initialState = {
  open: false,
  background: null,
  loading: false,
};

export default handleActions({
  [actions.toggle]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    background: payload.open ? payload.asset : null,
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
    background: payload,
    loading: false,
  }),
  [actions.didDelete]: (state, { payload }) => ({
    ...state,
    open: false,
  }),
}, initialState);
