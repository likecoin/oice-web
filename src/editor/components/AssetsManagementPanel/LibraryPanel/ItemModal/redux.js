import {
  createAction,
  handleActions,
} from 'redux-actions';

import {
  addItemBegin,
  addItemEnd,
  startUpdateAsset,
  updatedItem,
  deleteItemBegin,
  deleteItemEnd,
} from '../actions';

// Action Creators
export const toggleItemModal = createAction('TOGGLE_ITEM_MODAL');

// Reducers
const initialState = {
  open: false,
  item: null,
  loading: false,
};

export default handleActions({
  [toggleItemModal]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    item: payload.open ? payload.asset : null,
  }),
  [addItemBegin]: state => ({
    ...state,
    loading: true,
  }),
  [addItemEnd]: (state, { payload }) => ({
    ...state,
    open: false,
    loading: false,
  }),
  [startUpdateAsset]: (state, { payload }) => ({
    ...state,
    loading: true,
  }),
  [updatedItem]: (state, { payload }) => ({
    ...state,
    open: false,
    item: payload,
    loading: false,
  }),
  [deleteItemBegin]: state => ({
    ...state,
    loading: true,
  }),
  [deleteItemEnd]: (state, { payload }) => ({
    ...state,
    open: false,
    loading: false,
  }),
}, initialState);
