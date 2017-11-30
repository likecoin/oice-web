import { handleAction, handleActions } from 'redux-actions';
import _keyBy from 'lodash/keyBy';

import * as Actions from 'editor/actions/character';

const initialState = {
  characterList: [],
  characterLibraryIdSet: [],
  characterDictionary: {},
  loading: false,
};

export default handleActions({
  [Actions.fetchCharacterBegin]: state => ({
    ...state,
    loading: true,
  }),
  [Actions.fetchedCharacter]: (state, { payload }) => ({
    ...state,
    characterList: payload,
    characterDictionary: _keyBy(payload, 'id'),
    characterLibraryIdSet: new Set(payload.map(character => character.libraryId)),
    loading: false,
  }),
}, initialState);
