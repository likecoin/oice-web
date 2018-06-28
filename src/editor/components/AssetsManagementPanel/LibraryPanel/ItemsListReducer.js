import { handleActions } from 'redux-actions';

import Redux, {
  fetchItemsByLibraryBegin,
  fetchItemsByLibraryEnd,
  addItemEnd,
  updatedItem,
  deleteItemEnd,
  deselectLibrary,
} from './actions';

import { getUpdatedAssetsList } from './utils';

// Reducers
const initialState = {
  sync: false,
  items: [],
  loading: false,
};

export default handleActions({
  [fetchItemsByLibraryBegin]: state => ({
    ...state,
    loading: false,
  }),
  [fetchItemsByLibraryEnd]: (state, { payload }) => ({
    ...state,
    sync: true,
    items: payload,
    loading: true,
  }),
  [addItemEnd]: (state, { payload }) => ({
    ...state,
    sync: true,
    items: [...state.items, payload],
  }),
  [updatedItem]: (state, { payload }) => ({
    ...state,
    sync: true,
    items: getUpdatedAssetsList(state.items, payload),
  }),
  [deleteItemEnd]: (state, { payload }) => ({
    ...state,
    sync: true,
    items: getUpdatedAssetsList(state.items, payload),
  }),
  [deselectLibrary]: () => ({ ...initialState }),
}, initialState);
