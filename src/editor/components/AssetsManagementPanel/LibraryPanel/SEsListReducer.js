import { handleActions } from 'redux-actions';

import { startSoundUpload } from './UploadAudioAssetModal/actions';
import {
  addAssetsFailed,
} from './actions';

import {
  getUpdatedAssetsList,
} from './utils';

import * as ASSET_TYPE from 'common/constants/assetTypes';


const initialState = {
  loading: false,
  sync: false,
  SEs: [],
};

export default handleActions({
  [startSoundUpload]: (state, { payload }) => ({
    ...state,
    loading: payload === ASSET_TYPE.SOUND,
  }),
  FETCH_LIBRARY_SOUNDS: (state, { payload }) => ({
    ...state,
    sync: true,
    SEs: payload,
  }),
  ADD_MULTIPLE_SE: (state, { payload }) => ({
    ...state,
    sync: true,
    SEs: [...payload.reverse(), ...state.SEs],
    loading: false,
  }),
  [addAssetsFailed]: (state, { payload }) => (payload === ASSET_TYPE.SOUND ? {
    ...state,
    loading: false,
  } : state),
  UPDATE_SE: (state, { payload }) => ({
    ...state,
    sync: true,
    SEs: getUpdatedAssetsList(state.SEs, payload),
  }),
  DELETE_SE: (state, { payload }) => ({
    ...state,
    sync: true,
    SEs: getUpdatedAssetsList(state.SEs, payload),
  }),
  DESELECT_LIBRARY: () => initialState,
}, initialState);
