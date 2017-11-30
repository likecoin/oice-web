import { handleAction, handleActions } from 'redux-actions';

import _keyBy from 'lodash/keyBy';


const initialState = {
  list: [],
  dict: {},
};

export default handleActions({
  FETCHED_LIBRARIES: (state, { payload }) => {
    const list = [].concat.apply([], [
      payload.public,
      payload.private,
      payload.forSale,
      payload.selected,
    ]);
    return ({
      ...state,
      list,
      dict: _keyBy(list, item => item.id),
    });
  },
}, initialState);
