import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import AttributesPanelReducer from './AttributesPanel/reducer';
import Dashboard from '../Dashboard';
import ExportOiceModal from './ExportOiceModal';
import { reducer as ImportScriptModalReducer } from './ImportScriptModal';
import RecentUsed from './RecentUsed';
import RunOiceModal from './RunOiceModal';
import StoryPicker from './StoryPicker';
import { reducer as StorySettingModalReducer } from './StorySettingModal';

import {
  updateRunOiceState,
} from './actions';

import {
  LOADING,
} from 'editor/constants/stageType';


const initialState = {
  buildState: {
    id: null,
    info: null,
    message: 'saving',
    stage: LOADING,
  },
};

const editorPanelReducer = handleActions({
  [RunOiceModal.Action.open]: (state, { payload }) => ({
    ...state,
    buildState: {
      ...initialState.buildState,
      id: payload.id,
    },
  }),
  [RunOiceModal.Action.close]: state => update(state, {
    buildState: {
      id: { $set: null },
    },
  }),
  [ExportOiceModal.Action.open]: (state, { payload }) => ({
    ...state,
    buildState: {
      ...initialState.buildState,
      id: payload.id,
    },
  }),
  [ExportOiceModal.Action.close]: state => update(state, {
    buildState: {
      id: { $set: null },
    },
  }),
  [updateRunOiceState]: (state, { payload }) => {
    if (state.buildState.id === payload.id) {
      return {
        ...state,
        buildState: { ...payload },
      };
    }
    return state;
  },
}, initialState);

export default combineReducers({
  index: editorPanelReducer,
  AttributesPanel: AttributesPanelReducer,
  dashboard: Dashboard.Reducer,
  exportOiceModal: ExportOiceModal.Reducer,
  ImportScriptModal: ImportScriptModalReducer,
  RecentUsed: RecentUsed.Reducer,
  runOiceModal: RunOiceModal.Reducer,
  storyPicker: StoryPicker.Reducer,
  StorySettingModal: StorySettingModalReducer,
});
