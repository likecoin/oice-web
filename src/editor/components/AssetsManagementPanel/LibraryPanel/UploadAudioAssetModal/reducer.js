import {
  handleActions,
} from 'redux-actions';
import { replace } from 'react-router-redux';
import update from 'immutability-helper';

import {
  toggleUploadAudioAssetModal,
  addAudioFiles,
  removeAudioFile,
  startSoundUpload,
} from './actions';

import {
  addAssetsFailed,
  addedBGMs,
  addedSEs,
  updateUploadStatus,
} from '../actions';

// Reducers
const initialState = {
  audioFiles: null, // raw audio files
  open: false,
  type: null,
  uploadProgress: {},
  uploading: false,
};

export default handleActions({
  [toggleUploadAudioAssetModal]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    type: payload.open ? payload.type : null,
    audioFiles: payload.open ? payload.audioFiles : null,
    uploading: false,
  }),
  [addAudioFiles]: (state, { payload }) => update(state, {
    audioFiles: { $push: payload },
  }),
  [removeAudioFile]: (state, { payload }) => update(state, {
    audioFiles: { $splice: [[payload, 1]] },
  }),
  [addedBGMs]: (state) => ({
    ...state,
    open: false,
    uploadProgress: {},
    uploading: false,
  }),
  [addedSEs]: (state) => ({
    ...state,
    open: false,
    uploadProgress: {},
    uploading: false,
  }),
  [addAssetsFailed]: (state) => (
    state.open ? ({
      ...state,
      uploadProgress: {},
      uploading: false,
    }) : state
  ),
  [startSoundUpload]: (state) => ({
    ...state,
    uploading: true,
  }),
  [updateUploadStatus]: (state, { payload }) => update(state, {
    uploading: { $set: true },
    uploadProgress: {
      [payload.index]: { $set: payload.progess },
    },
  }),
}, initialState);
