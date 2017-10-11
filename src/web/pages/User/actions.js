import { createAction } from 'redux-actions';

import * as UserAPI from 'common/api/user';
import * as UserLinkAPI from 'common/api/userLink';
import { APIHandler } from 'common/utils/api';
import {
  fetchOicesFromUserStory,
} from 'common/api/oice';

export const fetchUserProfileBegin = createAction('FETCH_USER_CREDITS_BEGIN');
export const fetchUserProfileEnd = createAction('FETCH_USER_PROFILE_INFO_END');
export const fetchUserProfileDetailsEnd = createAction('FETCH_USER_CREDITS_END');
export const fetchUserLinksEnd = createAction('USER_LINKS_FETCH_END');
export const fetchUserProfile = userId => (dispatch) => {
  dispatch(fetchUserProfileBegin());
  APIHandler(dispatch,
    UserAPI.fetchUserProfile(userId)
    .then(user => dispatch(fetchUserProfileEnd({ user })))
  );
  APIHandler(dispatch,
    UserAPI.fetchUserProfileDetails(userId)
    .then(profile => dispatch(fetchUserProfileDetailsEnd(profile)))
  );
  APIHandler(dispatch,
    UserLinkAPI.fetchUserLinks(userId)
    .then(links => dispatch(fetchUserLinksEnd({ links })))
  );
};

export const fetchOicesFromStoryEnd = createAction('FETCH_OICES_FROM_STORY_END');
export const fetchOicesFromStory = (userId, storyId) => (dispatch) => {
  APIHandler(dispatch,
    fetchOicesFromUserStory(userId, storyId)
    .then(oices => dispatch(fetchOicesFromStoryEnd(oices)))
  );
};
export const closeOiceList = createAction('CLOSE_OICE_LIST');
