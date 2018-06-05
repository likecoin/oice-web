import { handleActions } from 'redux-actions';

import update from 'immutability-helper';
import _forEachRight from 'lodash/forEachRight';

import * as Actions from './UploadAudioAssetModal.actions';
import * as CommonActions from '../LibraryDetails/LibraryDetails.common.actions';


const initialState = {
  audioFiles: null, // raw audio files
  open: false,
  type: null,
  uploadProgress: {},
  uploading: false,
  uploadStatus: [], // array of { id, error }
  error: null,
};

function handleDidUploadAudios(state) {
  const audioFiles = [...state.audioFiles];
  const uploadStatus = [...state.uploadStatus];
  _forEachRight(state.uploadStatus, (status, index) => {
    if (!status.error) {
      // only keep unsuccessful transcoded files on screen
      audioFiles.splice(index, 1);
      uploadStatus.splice(index, 1);
    }
  });
  const open = audioFiles.length > 0;
  return update(state, {
    audioFiles: { $set: audioFiles },
    open: { $set: open },
    uploadProgress: { $set: {} },
    uploading: { $set: false },
    uploadStatus: { $set: uploadStatus },
  });
}

export default handleActions({
  [Actions.toggle]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    type: payload.open ? payload.type : null,
    audioFiles: payload.open ? payload.audioFiles : null,
    uploading: false,
    error: null,
    uploadStatus: [],
  }),
  [Actions.addAudioFiles]: (state, { payload }) => {
    // clear unsuccessful uploads
    const operation = state.uploadStatus.length > 0 ? '$set' : '$push';
    const audioFiles = [...payload];
    return update(state, {
      audioFiles: { [operation]: audioFiles },
      uploadStatus: { $set: [] },
      error: { $set: null },
    });
  },
  [Actions.removeAudioFile]: (state, { payload }) => update(state, {
    audioFiles: { $splice: [[payload, 1]] },
  }),
  [Actions.didAddBGMs]: state => handleDidUploadAudios(state),
  [Actions.didAddSEs]: state => handleDidUploadAudios(state),
  [CommonActions.addAssetsFailed]: state => (
    state.open ? update(state, {
      uploadProgress: { $set: {} },
      uploading: { $set: false },
    }) : state
  ),
  [CommonActions.updateUploadStatus]: (state, { payload }) => update(state, {
    uploading: { $set: true },
    uploadProgress: {
      [payload.index]: { $set: payload.progess },
    },
    uploadStatus: { $set: [] },
  }),
  [Actions.onError]: (state, { payload }) => update(state, {
    error: { $set: payload.error },
    uploading: { $set: false },
  }),
  [Actions.transcodedAudioFile]: (state, { payload }) => update(state, {
    uploadStatus: { $push: [payload] },
  }),
}, initialState);
