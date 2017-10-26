import { handleActions } from 'redux-actions';

import update from 'immutability-helper';

import * as Actions from './EditAudioAssetModal.actions';
import * as CommonActions from '../LibraryDetails/LibraryDetails.common.actions';

const initialState = {
  open: false,
  asset: null,
  type: null,
  uploading: false,
  error: null,
};

function handleDidUpdateAudio(state) {
  return update(state, {
    // do not close modal to show error if any
    open: { $set: !!state.error },
    uploading: { $set: false },
  });
}

function handleDidDeleteAudio(state) {
  return update(state, {
    open: { $set: false },
    uploading: { $set: false },
  });
}

export default handleActions({
  [Actions.toggle]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    type: payload.open ? payload.type : null,
    asset: payload.open ? payload.asset : null,
    uploading: false,
    error: null,
  }),
  [Actions.changeAudioUpload]: state => update(state, {
    error: { $set: null },
  }),
  [CommonActions.startUpdateAsset]: state => update(state, {
    uploading: { $set: true },
  }),
  [Actions.didUpdateSE]: state => handleDidUpdateAudio(state),
  [Actions.didDeleteSE]: state => handleDidDeleteAudio(state),
  [Actions.didUpdateBGM]: state => handleDidUpdateAudio(state),
  [Actions.didDeleteBGM]: state => handleDidDeleteAudio(state),
  [Actions.onError]: (state, { payload }) => update(state, {
    error: { $set: payload.error },
    uploading: { $set: false },
  }),
}, initialState);
