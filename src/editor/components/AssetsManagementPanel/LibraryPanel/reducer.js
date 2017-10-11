import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import charactersListReducer from './CharactersListReducer';
import characterModalReducer from './CharacterModal/reducer';
import backgroundsListReducer from './BackgroundsListReducer';
import backgroundModalReducer from './BackgroundModal/redux';
import itemsListReducer from './ItemsListReducer';
import itemModalReducer from './ItemModal/redux';
import BGMsListReducer from './BGMsListReducer';
import SEsListReducer from './SEsListReducer';
import uploadAudioAssetModalReducer from './UploadAudioAssetModal/reducer';
import editAudioAssetModalReducer from './EditAudioAssetModal/redux';

import {
  selectedLibrary,
  fetchedSelectedLibraryById,
  deselectLibrary,
} from './actions';


// Reducers
const initialState = null;

const selectedLibraryReducer = handleActions({
  [selectedLibrary]: (state, { payload }) => ({
    ...payload,
  }),
  [fetchedSelectedLibraryById]: (state, { payload }) => ({
    ...payload,
  }),
  UPDATE_LIBRARY: (state, { payload }) => ({
    ...payload,
  }),
  [deselectLibrary]: (state, { payload }) => null,
  DELETE_LIBRARY: (state, { payload }) => null,
}, initialState);

export default combineReducers({
  backgroundModal: backgroundModalReducer,
  backgroundsList: backgroundsListReducer,
  BGMsList: BGMsListReducer,
  characterModal: characterModalReducer,
  charactersList: charactersListReducer,
  editAudioAssetModal: editAudioAssetModalReducer,
  itemModal: itemModalReducer,
  itemsList: itemsListReducer,
  selectedLibrary: selectedLibraryReducer,
  SEsList: SEsListReducer,
  uploadAudioAssetModal: uploadAudioAssetModalReducer,
});
