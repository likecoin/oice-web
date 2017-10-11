import { handleActions } from 'redux-actions';

import * as actions from './BackgroundModal.actions';

const initialState = {
  open: false,
  background: null,
};

export default handleActions({
  [actions.toggle]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    background: payload.open ? payload.asset : null,
  }),
  [actions.didAdd]: (state, { payload }) => ({
    ...state,
    open: false,
  }),
  [actions.didUpdate]: (state, { payload }) => ({
    ...state,
    open: false,
    background: payload,
  }),
  [actions.didDelete]: (state, { payload }) => ({
    ...state,
    open: false,
  }),
}, initialState);
