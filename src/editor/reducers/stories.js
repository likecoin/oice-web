import { handleAction, handleActions } from 'redux-actions';
import update from 'immutability-helper';

import _pull from 'lodash/pull';
import _union from 'lodash/union';

import { FETCH_CHARACTER } from 'editor/constants/actionTypes';

import { actions as StorySettingModalActions } from 'editor/components/EditorPanel/StorySettingModal';

import * as StoryAction from 'editor/actions/story';


const initialState = {
  characterDictionary: {},
  characterList: [],
  list: [],
  selected: null,
  supportedLanguages: undefined,
};

const getStoryIndex = (state, storyId) => state.list.findIndex(story => story.id === storyId);

export default handleActions({
  [StoryAction.fetchedStories]: (state, { payload }) => ({
    ...state,
    list: payload.list,
  }),
  [StoryAction.addedStory]: (state, { payload }) => ({
    ...state,
    list: [...state.list, payload],
  }),
  [StoryAction.selectedStory]: (state, { payload }) => ({
    ...state,
    selected: payload,
  }),
  [StoryAction.unselectStory]: state => ({
    ...state,
    selected: null,
    supportedLanguages: null,
  }),
  [StorySettingModalActions.saveStoryEnd]: (state, { payload }) => {
    const index = getStoryIndex(state, payload.story.id);
    const newSelectedStory = state.selected ? payload.story : state.selected;
    return update(state, {
      list: { [index]: { $set: payload.story } },
      selected: { $set: newSelectedStory },
    });
  },
  [StorySettingModalActions.deleteStoryEnd]: (state, { payload }) => {
    const index = getStoryIndex(state, payload.storyId);
    return update(state, {
      list: { $splice: [[index, 1]] },
      selected: { $set: null },
    });
  },
  [StorySettingModalActions.saveStoryOgImageEnd]: (state, { payload }) => {
    const index = getStoryIndex(state, payload.story.id);
    return update(state, {
      list: { [index]: { $set: payload.story } },
    });
  },
  [StorySettingModalActions.saveNewLanguagesEnd]: (state, { payload }) => ({
    ...state,
    supportedLanguages: state.supportedLanguages ? _union(state.supportedLanguages, payload.languages) : undefined,
  }),
  [StorySettingModalActions.saveDeletedLanguagesEnd]: (state, { payload }) => ({
    ...state,
    supportedLanguages: state.supportedLanguages ? _pull(state.supportedLanguages, payload.language) : undefined,
  }),
  FETCH_CHARACTER: (state, { payload }) => {
    const characterDictionary = {};
    payload.forEach((data) => {
      characterDictionary[data.id] = data;
    });
    return ({
      ...state,
      characterList: payload,
      characterDictionary,
    });
  },
  [StoryAction.fetchStoryLanguagesBegin]: state => ({
    ...state,
    supportedLanguages: undefined,
  }),
  [StoryAction.fetchStoryLanguagesEnd]: (state, { payload }) => ({
    ...state,
    supportedLanguages: payload.languages,
  }),
}, initialState);
