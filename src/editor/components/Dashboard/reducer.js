import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import _unionBy from 'lodash/unionBy';

import { actions as StorySettingModalActions } from 'editor/components/EditorPanel/StorySettingModal';
import Actions from './actions';

const initialState = {
  oices: [],
  selectedStoryId: undefined,
};

export default handleActions({
  [Actions.beginFetchOices]: (state, { payload }) => ({
    ...state,
    oices: [],
  }),
  [Actions.fetchedOices]: (state, { payload }) => ({
    ...state,
    oices: payload,
  }),
  [Actions.updatedOice]: (state, { payload }) => {
    const index = state.oices.findIndex(oice => oice.id === payload.id);
    const newOices = update(state.oices, {
      [index]: { $set: payload },
    });
    return ({
      ...state,
      oices: newOices,
    });
  },
  [Actions.deletedOice]: (state, { payload }) => {
    const index = state.oices.findIndex(oice => oice.id === payload);
    let newOices = [...state.oices];
    if (index >= 0) {
      newOices = update(state.oices, {
        $splice: [[index, 1]],
      });
    }
    return ({
      ...state,
      oices: newOices,
    });
  },
  [Actions.updateSelectedStoryId]: (state, { payload }) => ({
    ...state,
    selectedStoryId: payload,
  }),
  [StorySettingModalActions.saveOiceOrderEnd]: (state, { payload }) => ({
    ...state,
    oices: payload.oiceList,
  }),
  [StorySettingModalActions.saveOicesEnd]: (state, { payload }) => {
    const newOices = _unionBy(payload.oices, state.oices, 'id');
    return update(state, {
      oices: { $set: newOices },
    });
  },
  [StorySettingModalActions.deleteOicesEnd]: (state, { payload }) => {
    const newOiceList = state.oices.filter(oice => !payload.oiceIds.includes(oice.id));
    return update(state, {
      oices: { $set: newOiceList },
    });
  },
}, initialState);
