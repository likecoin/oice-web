import {
  createAction,
  handleAction,
  handleActions,
} from 'redux-actions';

import * as Actions from 'editor/actions/modal';

// Actions
export const UPDATE_SELECTED_AUDIO = 'UPDATE_SELECTED_AUDIO';


// Action Creators
export const updateSelectedItem = createAction(UPDATE_SELECTED_AUDIO);


// Reducers
const initialState = {
  // for SelectionModal
  open: false,
  title: '',
  width: null,
  className: null,

  // audio
  selectedAudio: null,
  audios: [],
  assetLibraryIds: [],
  onSelected: null,
  recentUsedAsset: null,
};

export default handleActions({
  [Actions.openAudioSelectionModal]: (state, { payload }) => ({
    ...state,
    audios: payload.audios || [],
    assetLibraryIds: payload.assetLibraryIds || [],
    className: payload.className || null,
    open: true,
    recentUsedAsset: payload.recentUsedAsset || null,
    selectedAudio: payload.selectedAudio,
    title: payload.title || '',
    width: payload.width || null,
    onSelected: payload.onSelected || null,
  }),
  [Actions.closeAudioSelectionModal]: (state, { payload }) => ({
    ...state,
    open: false,
    audios: [],
  }),
  [updateSelectedItem]: (state, { payload }) => ({
    ...state,
    selectedAudio: payload,
  }),
}, initialState);
