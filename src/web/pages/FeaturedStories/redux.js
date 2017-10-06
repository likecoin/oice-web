import { createAction, handleActions } from 'redux-actions';
import { APIHandler } from 'common/utils/api';

import * as StoryAPI from 'common/api/story';


// Action Creators
const willFetchFeaturedStories = createAction('FEATURED_STORIES_WILL_FETCH');
const didFetchFeaturedStories = createAction('FEATURED_STORIES_DID_FETCH');

export const fetchFeaturedStories = () => (dispatch) => {
  dispatch(willFetchFeaturedStories());
  return APIHandler(dispatch,
    StoryAPI
    .fetchFeaturedStory()
    .then(stories => dispatch(didFetchFeaturedStories(stories)))
  );
};


// Reducers
const initialState = {
  stories: null,
  isLoading: false,
  isLoaded: false,
};

export default handleActions({
  [willFetchFeaturedStories]: state => ({
    ...state,
    isLoading: true,
  }),
  [didFetchFeaturedStories]: (state, { payload }) => ({
    ...state,
    stories: payload,
    isLoading: false,
    isLoaded: true,
  }),
}, initialState);
