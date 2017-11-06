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
  libraries: [],
  title: '',
  width: null,
  className: null,

  // audio
  selectedAudio: null,
  audios: [],
  onSelected: null,
};

export default handleActions({
  [Actions.openAudioSelectionModal]: (state, { payload }) => ({
    ...state,
    open: true,
    libraries: payload.libraries || [],
    title: payload.title || '',
    width: payload.width || null,
    className: payload.className || null,
    selectedAudio: payload.selectedAudio,
    audios: payload.audios || [],
    onSelected: payload.onSelected || null,
  }),
  [Actions.closeAudioSelectionModal]: (state, { payload }) => ({
    ...state,
    open: false,
    libraries: [],
    audios: [],
  }),
  [updateSelectedItem]: (state, { payload }) => ({
    ...state,
    selectedAudio: payload,
  }),
}, initialState);
