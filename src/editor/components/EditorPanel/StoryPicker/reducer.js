import { handleActions } from 'redux-actions';

import Action from './actions';


const initialState = {
  open: false,
  selectedId: null,
  onSelect: null,
  description: '',
};

export default handleActions({
  [Action.open]: (state, { payload }) => ({
    ...state,
    open: true,
    ...payload,
  }),
  [Action.close]: (state => ({
    ...state,
    open: false,
  })),
}, initialState);
