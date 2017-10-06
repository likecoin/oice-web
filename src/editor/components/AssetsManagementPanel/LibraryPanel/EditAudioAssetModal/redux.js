import {
  createAction,
  handleActions,
} from 'redux-actions';
import { replace } from 'react-router-redux';

// Reducers
const initialState = {
  open: false,
  asset: null,
  type: null,
  uploading: false,
};

export default handleActions({
  TOGGLE_EDIT_AUDIO_ASSET_MODAL: (state, { payload }) => ({
    ...state,
    open: payload.open,
    type: payload.open ? payload.type : null,
    asset: payload.open ? payload.asset : null,
    uploading: false,
    readonly: payload.open ? payload.readonly : state.readonly,
  }),
  START_UPDATE_ASSET: (state) => ({
    ...state,
    uploading: true,
  }),
  UPDATE_SE: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
  DELETE_SE: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
  UPDATE_BGM: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
  DELETE_BGM: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
}, initialState);

// Action Creators
const TOGGLE_EDIT_AUDIO_ASSET_MODAL = 'TOGGLE_EDIT_AUDIO_ASSET_MODAL';
export const toggleEditAudioAssetModal = createAction(TOGGLE_EDIT_AUDIO_ASSET_MODAL);
