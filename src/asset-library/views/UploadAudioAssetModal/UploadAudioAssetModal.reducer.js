import { handleActions } from 'redux-actions';

import update from 'immutability-helper';

import * as Actions from './UploadAudioAssetModal.actions';
import * as CommonActions from '../LibraryDetails/LibraryDetails.common.actions';


const initialState = {
  audioFiles: null, // raw audio files
  open: false,
  type: null,
  uploadProgress: {},
  uploading: false,
};

export default handleActions({
  [Actions.toggle]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    type: payload.open ? payload.type : null,
    audioFiles: payload.open ? payload.audioFiles : null,
    uploading: false,
  }),
  [Actions.addAudioFiles]: (state, { payload }) => update(state, {
    audioFiles: { $push: payload },
  }),
  [Actions.removeAudioFile]: (state, { payload }) => update(state, {
    audioFiles: { $splice: [[payload, 1]] },
  }),
  [Actions.didAddBGMs]: (state) => ({
    ...state,
    open: false,
    uploadProgress: {},
    uploading: false,
  }),
  [Actions.didAddSEs]: (state) => ({
    ...state,
    open: false,
    uploadProgress: {},
    uploading: false,
  }),
  [CommonActions.addAssetsFailed]: (state) => (
    state.open ? ({
      ...state,
      uploadProgress: {},
      uploading: false,
    }) : state
  ),
  [CommonActions.startSoundUpload]: (state) => ({
    ...state,
    uploading: true,
  }),
  [CommonActions.updateUploadStatus]: (state, { payload }) => update(state, {
    uploading: { $set: true },
    uploadProgress: {
      [payload.index]: { $set: payload.progess },
    },
  }),
}, initialState);
