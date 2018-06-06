import { handleActions } from 'redux-actions';

import Action from './actions';


const initialState = {
  open: false,
};

export default handleActions({
  [Action.open]: (state, { payload }) => ({
    ...state,
    open: true,
  }),
  [Action.close]: state => ({
    ...state,
    open: false,
  }),
}, initialState);
