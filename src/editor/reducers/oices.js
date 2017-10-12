import { handleAction, handleActions } from 'redux-actions';
import update from 'immutability-helper';

import _unionBy from 'lodash/unionBy';

import * as Actions from 'editor/actions/oice';
import { actions as StorySettingModalActions } from 'editor/components/EditorPanel/StorySettingModal';

const initialState = {
  fetching: false,
  list: [],
  selected: null,
};

export default handleActions({
  [Actions.fetchOiceBegin]: state => (
    update(state, {
      fetching: { $set: true },
    })
  ),
  FETCHED_OICES: (state, { payload }) => (
    update(state, {
      list: { $set: payload },
      fetching: { $set: false },
    })
  ),
  ADDED_OICE: (state, { payload }) => {
    const copyList = [...state.list];
    copyList.push(payload);
    return ({
      ...state,
      list: copyList,
    });
  },
  SELECTED_OICE: (state, { payload }) => ({
    ...state,
    selected: payload,
  }),
  [Actions.unselectOice]: state => ({
    ...state,
    selected: null,
  }),
  UPDATED_OICE: (state, { payload }) => {
    const copyList = [...state.list];
    for (let i = 0; i < copyList.length; i++) {
      if (copyList[i].id === payload.id) {
        copyList[i] = payload;
      }
    }
    return ({
      ...state,
      list: copyList,
    });
  },
  DELETED_OICE: (state, { payload }) => {
    const oiceId = payload;
    const copyList = [...state.list];
    const index = copyList.findIndex(o => o.id === oiceId);
    copyList.splice(index, 1);
    return ({
      ...state,
      list: copyList,
      selected: null,
    });
  },
  FETCH_SELECTED_OICE: (state, { payload }) => ({
    ...state,
    selected: payload,
  }),
  [StorySettingModalActions.saveOiceOrderEnd]: (state, { payload }) => ({
    ...state,
    list: payload.oiceList,
  }),
  [StorySettingModalActions.saveOicesEnd]: (state, { payload }) => {
    const newOices = _unionBy(payload.oices, state.oices, 'id');
    return update(state, {
      list: { $set: newOices },
    });
  },
  [StorySettingModalActions.saveSelectedOiceEnd]: (state, { payload }) => (
    update(state, {
      selected: { $set: payload.oice },
    })
  ),
}, initialState);
