import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import * as Actions from './ImportScriptModal.actions';
import { STAGE } from './ImportScriptModal.constants';


const initialState = {
  open: false,
  loading: false,
  progress: 0,
  stage: null,
  error: null,
};

export default handleActions({
  [Actions.open]: (state, action) => ({
    ...initialState,
    open: true,
  }),
  [Actions.close]: (state, action) => ({
    ...state,
    open: false,
  }),
  [Actions.onProgress]: (state, action) => ({
    ...state,
    progress: action.payload,
  }),
  [Actions.onError]: (state, action) => ({
    ...state,
    loading: false,
    progress: 0,
    stage: null,
    error: action.payload,
  }),
  [Actions.onStageChange]: (state, action) => {
    const stage = action.payload;
    const nextState = { ...state, stage };

    switch (stage) {
      case STAGE.UPLOADING:
        nextState.error = null;
        nextState.loading = true;
        break;
      case STAGE.FINISHED:
        nextState.loading = false;
        nextState.open = false;
        break;
      default:
        break;
    }
    return nextState;
  },
}, initialState);
