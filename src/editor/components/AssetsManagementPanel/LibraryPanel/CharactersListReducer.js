import { handleActions } from 'redux-actions';

import {
  addedCharacter,
  updatedCharacter,
  deletedCharacter,
} from './CharacterModal/actions';

import {
  getUpdatedAssetsList,
} from './utils';

// Reducers
const initialState = {
  sync: false,
  characters: [],
};

export default handleActions({
  FETCH_LIBRARY_CHARACTERS: (state, { payload }) => ({
    ...state,
    sync: true,
    characters: payload,
  }),
  [addedCharacter]: (state, { payload }) => ({
    ...state,
    sync: true,
    characters: [...state.characters, payload],
  }),
  [updatedCharacter]: (state, { payload }) => ({
    ...state,
    sync: true,
    characters: getUpdatedAssetsList(state.characters, payload),
  }),
  [deletedCharacter]: (state, { payload }) => ({
    ...state,
    sync: true,
    characters: getUpdatedAssetsList(state.characters, payload),
  }),
  DESELECT_LIBRARY: () => initialState,
}, initialState);
