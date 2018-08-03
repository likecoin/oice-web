import { createAction } from 'redux-actions';

import * as LikeCoinTx from 'common/api/likecoin';
import { APIHandler } from 'common/utils/api';

export const validateLikeCoinTxBegin = createAction('LIKECOIN_TX_VALIDATE_BEGIN');
export const validateLikeCoinFailed = createAction('LIKECOIN_TX_VALIDATE_FAILED');
export const validatedLikeCoinTx = createAction('LIKECOIN_TX_VALIDATED');
export const validateLikeCoinTx = id => (dispatch) => {
  dispatch(validateLikeCoinTxBegin());
  APIHandler(dispatch,
    LikeCoinTx.validateLikeCoinTx(id)
      .then(product => dispatch(validatedLikeCoinTx(product))),
    (_, message) => {
      dispatch(validateLikeCoinFailed(message));
    },
    [
      'ERR_LIKECOIN_TX_HASH_NOT_EXIST',
      'ERR_LIKECOIN_TX_VALIDATE_TX_HASH_NOT_MATCH',
      'ERR_LIKECOIN_TX_VALIDATE_FROM_ADDRESS_NOT_MATCH',
      'ERR_LIKECOIN_TX_VALIDATE_TO_ADDRESS_NOT_MATCH',
      'ERR_LIKECOIN_TX_VALIDATE_AMOUNT_NOT_MATCH',
      'ERR_LIKECOIN_TX_VALIDATE_REWARD_NOT_MATCH',
      'ERR_LIKECOIN_TX_VALIDATE_EXISTED',
    ],
  );
};
