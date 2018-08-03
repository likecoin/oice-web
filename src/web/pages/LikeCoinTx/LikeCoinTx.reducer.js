import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import * as Actions from './LikeCoinTx.actions';

// Reducers
const initialState = {
  isValidating: false,
  product: null,
  error: null,
};

export default handleActions({
  [Actions.validateLikeCoinTxBegin]: (state, { payload }) => update(state, {
    isValidating: { $set: true },
  }),
  [Actions.validatedLikeCoinTx]: (state, { payload }) => update(state, {
    product: { $set: payload },
    isValidating: { $set: false },
  }),
  [Actions.validateLikeCoinFailed]: (state, { payload }) => update(state, {
    error: { $set: payload },
    isValidating: { $set: false },
  }),
}, initialState);
