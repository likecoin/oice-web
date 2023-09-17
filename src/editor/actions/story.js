import { createAction } from 'redux-actions';
import * as StoryAPI from 'common/api/story';
import { APIHandler } from 'common/utils/api';
import * as CrispUtils from 'common/utils/crisp';

import * as CharacterAction from './character';
import * as AssetAction from './asset';


export const fetchedStories = createAction('FETCHED_STORIES');
export const fetchStories = () => dispatch => APIHandler(dispatch,
  StoryAPI.fetchStories()
    .then((stories) => {
      CrispUtils.update('_story_count', stories.length);
      dispatch(fetchedStories({ list: stories }));
    })
);

export const unselectStory = createAction('STORY_UNSELECT');
export const selectedStory = createAction('SELECT_STORY');
export const selectStory = story => (dispatch) => {
  dispatch(selectedStory(story));
};

export const fetchSelectedStory = (storyId, language) => dispatch => APIHandler(dispatch,
  StoryAPI.fetchStory(storyId, language)
    .then(story => dispatch(selectedStory(story)))
);

export const fetchStoryLanguagesBegin = createAction('STORY_LANGUAGES_FETCH_BEGIN');
export const fetchStoryLanguagesEnd = createAction('STORY_LANGUAGES_FETCH_END');

export const addedStory = createAction('ADDED_STORY');
export const addStory = newStoryName => dispatch => APIHandler(dispatch,
  StoryAPI.addStory(newStoryName)
    .then((story) => {
      dispatch(addedStory(story));
      dispatch(fetchStoryLanguagesEnd({ languages: [story.language] })); // new story has only main language
    })
);

export const forkStory = storyId => dispatch => APIHandler(dispatch,
  StoryAPI.forkStory(storyId)
    .then((story) => {
      dispatch(addedStory(story));
    })
);

export const fetchStoryLanguages = storyId => async (dispatch) => {
  const languages = await APIHandler(dispatch, StoryAPI.fetchLanguage(storyId));
  dispatch(fetchStoryLanguagesEnd({ languages }));
};
