import {
  createAction,
  handleAction,
  handleActions,
} from 'redux-actions';

// Actions
export const UPDATE_SELECTED_AUDIO = 'UPDATE_SELECTED_AUDIO';


// Action Creators
export const updateSelectedItem = createAction(UPDATE_SELECTED_AUDIO);


// Reducers
const initialState = {
  // for SelectionModal
  open: false,
  libraries: [], // array
  title: '',
  width: null,
  className: null,
  // audio
  selectedAudio: null,
  audios: [],
  onSelected: null,
};

export default handleActions({
  OPEN_AUDIO_SELECTION_MODAL: (state, { payload }) => ({
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
  CLOSE_AUDIO_SELECTION_MODAL: (state, { payload }) => ({
    ...state,
    open: false,
  }),
  UPDATE_SELECTED_AUDIO: (state, { payload }) => ({
    ...state,
    selectedAudio: payload,
  }),
}, initialState);
