import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import * as Actions from './LikeCoinTx.actions';

// Reducers
const initialState = {
  product: null,
  error: null,
};

export default handleActions({
  [Actions.validatedLikeCoinTx]: (state, { payload }) => update(state, {
    product: { $set: payload },
  }),
  [Actions.validateLikeCoinFailed]: (state, { payload }) => update(state, {
    error: { $set: payload },
  }),
}, initialState);
