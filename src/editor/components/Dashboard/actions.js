import { createAction } from 'redux-actions';
import { push } from 'react-router-redux';

import * as OiceAPI from 'common/api/oice';
import * as StoryAPI from 'common/api/story';
import { APIHandler } from 'common/utils/api';

import * as OiceAction from 'editor/actions/oice';
import * as StoryAction from 'editor/actions/story';

const updateSelectedStoryId = createAction('UPDATE_SELECTED_STORY_ID');

const beginFetchOices = createAction('BEGIN_FETCH_OICES_IN_OICE_LIST');
const fetchedOices = createAction('END_FETCH_OICES_IN_OICE_LIST');
const fetchOices = (storyId, language) => (dispatch) => {
  dispatch(beginFetchOices());
  dispatch(updateSelectedStoryId(storyId));
  APIHandler(dispatch,
    OiceAPI.fetchOices(storyId, language)
    .then(oices =>
      dispatch(fetchedOices(oices))
    )
  );
};

const updatedOice = createAction('UPDATED_OICE');
const deletedOice = createAction('DELETED_OICE');

const addStory = () => async (dispatch) => {
  const story = await APIHandler(dispatch, StoryAPI.addStory());
  dispatch(StoryAction.addedStory(story));

  const oice = await APIHandler(dispatch, OiceAPI.addOice(story.id));
  dispatch(OiceAction.selectOice(oice));

  // fetch the assets and language
  dispatch(StoryAction.selectStory(story));
  dispatch(StoryAction.fetchStoryLanguagesEnd({ languages: [story.language] }));
};

const addOice = storyId => async (dispatch) => {
  const oice = await APIHandler(dispatch, OiceAPI.addOice(storyId));
  dispatch(OiceAction.selectOice(oice));
};

export default {
  beginFetchOices,
  fetchedOices,
  fetchOices,
  updatedOice,
  deletedOice,
  updateSelectedStoryId,
  addStory,
  addOice,
};
