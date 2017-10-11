import { handleActions } from 'redux-actions';

import * as Actions from './EditAudioAssetModal.actions';
import * as CommonActions from '../LibraryDetails/LibraryDetails.common.actions';

const initialState = {
  open: false,
  asset: null,
  type: null,
  uploading: false,
};

export default handleActions({
  [Actions.toggle]: (state, { payload }) => ({
    ...state,
    open: payload.open,
    type: payload.open ? payload.type : null,
    asset: payload.open ? payload.asset : null,
    uploading: false,
  }),
  [CommonActions.startUpdateAsset]: (state) => ({
    ...state,
    uploading: true,
  }),
  [Actions.didUpdateSE]: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
  [Actions.didDeleteSE]: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
  [Actions.didUpdateBGM]: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
  [Actions.didDeleteBGM]: (state) => ({
    ...state,
    open: false,
    uploading: false,
  }),
}, initialState);
