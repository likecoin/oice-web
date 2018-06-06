import { handleActions } from 'redux-actions';

import * as ASSET_TYPE from 'common/constants/assetTypes';

import { startSoundUpload } from './UploadAudioAssetModal/actions';
import { addAssetsFailed } from './actions';

import { getUpdatedAssetsList } from './utils';


const initialState = {
  loading: false,
  sync: false,
  BGMs: [],
};

export default handleActions({
  [startSoundUpload]: (state, { payload }) => ({
    ...state,
    loading: payload === ASSET_TYPE.MUSIC,
  }),
  FETCH_LIBRARY_MUSICS: (state, { payload }) => ({
    ...state,
    sync: true,
    BGMs: payload,
  }),
  ADD_MULTIPLE_BGM: (state, { payload }) => ({
    ...state,
    sync: true,
    BGMs: [...payload.reverse(), ...state.BGMs],
    loading: false,
  }),
  [addAssetsFailed]: (state, { payload }) => (payload === ASSET_TYPE.MUSIC ? {
    ...state,
    loading: false,
  } : state),
  UPDATE_BGM: (state, { payload }) => ({
    ...state,
    sync: true,
    BGMs: getUpdatedAssetsList(state.BGMs, payload),
  }),
  DELETE_BGM: (state, { payload }) => ({
    ...state,
    sync: true,
    BGMs: getUpdatedAssetsList(state.BGMs, payload),
  }),
  DESELECT_LIBRARY: () => initialState,
}, initialState);
