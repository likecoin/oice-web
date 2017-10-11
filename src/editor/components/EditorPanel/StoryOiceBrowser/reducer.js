import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import Actions from './actions';
import { reducer as StorySettingModalActions } from '../StorySettingModal';


const initialState = {
  isAddingOice: false,
  isAddingStory: false,
  loading: false,
  oices: [],
  open: false,
  selectedStory: {},
  tabSelectedIndex: 0,
};

export default handleActions({
  [Actions.openStoryListModal]: (state, { payload }) => ({
    ...state,
    loading: false,
    oices: [],
    open: true,
    selectedStory: {},
    tabSelectedIndex: 0,
    isAddingStory: payload || false,
  }),
  [Actions.openOiceListModal]: (state, { payload }) => ({
    ...state,
    oices: payload.oices,
    open: true,
    selectedStory: payload.selectedStory,
    tabSelectedIndex: 1,
    isAddingOice: payload.isAddingOice || false,
  }),
  [Actions.closeStoryListOice]: state => ({
    ...state,
    open: false,
  }),
  [Actions.setSelectedTabIndex]: (state, { payload }) => ({
    ...state,
    tabSelectedIndex: payload,
  }),
  [Actions.selectStory]: (state, { payload }) => ({
    ...state,
    selectedStory: payload,
  }),
  [Actions.beginFetchOices]: state => ({
    ...state,
    loading: true,
  }),
  [Actions.fetchedOices]: (state, { payload }) => ({
    ...state,
    loading: false,
    oices: payload,
  }),
  [Actions.updatedOicesOrder]: (state, { payload }) => ({
    ...state,
    oices: payload,
  }),
  [Actions.beginAddOice]: state => ({
    ...state,
    loading: true,
  }),
  [Actions.addedOice]: (state, { payload }) => ({
    ...state,
    loading: false,
    oices: [...state.oices, payload],
  }),
  [Actions.updateIsAddingStatus]: state => ({
    ...state,
    isAddingOice: false,
    isAddingStory: false,
  }),
  [StorySettingModalActions.deleteStoryEnd]: state => update(state, {
    selectedStory: { $set: null },
    tabSelectedIndex: { $set: 0 },
  }),
  // [StorySettingModalActions.deletedOice]: (state, { payload }) => update(state, {
  //   oices: { $splice: [[state.oices.findIndex((o) => o.id === payload), 1]] },
  //   tabSelectedIndex: { $set: 1 },
  // }),
}, initialState);
