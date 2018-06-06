import { handleActions } from 'redux-actions';

import Action from './actions';


const initialState = {
  open: false,
  preview: true,
};

export default handleActions({
  [Action.open]: (state, { payload }) => ({
    ...state,
    open: true,
    preview: payload.preview,
  }),
  [Action.close]: state => ({
    ...state,
    open: false,
  }),
}, initialState);
