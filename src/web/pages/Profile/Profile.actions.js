import { createAction } from 'redux-actions';
import async from 'async';

import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';

import * as UserAPI from 'common/api/user';
import * as UserLinkAPI from 'common/api/userLink';

import { updateUserMeta } from 'common/actions/user';

import { backToWeb } from 'common/utils';
import { APIHandler } from 'common/utils/api';


// Actions
export const updateUserProfileBegin = createAction('USER_PROFILE_UPDATE_BEGIN');
export const updatedUserProfile = createAction('UPDATED_USER_PROFILE');
export const updatedUserAvatar = createAction('UPDATED_USER_AVATAR');
export const startLoading = createAction('START_LOADING');

export const updateUser = payload => async (dispatch, getState) => {
  const currentUser = getState().Profile.userProfile;

  const keys = Object.keys(payload);
  const updatedObject = keys.reduce((obj, key) => {
    if (key !== 'avatar' && _get(currentUser, key) !== payload[key]) {
      return ({
        ...obj,
        [key]: payload[key],
      });
    }
    return obj;
  }, {});

  // only update when the user field is changed
  if (Object.keys(updatedObject).length > 0 || payload.avatar) {
    dispatch(updateUserProfileBegin());
    const updatedUser = await dispatch(updateUserMeta({
      meta: updatedObject,
      avatar: payload.avatar,
    }));
    dispatch(updatedUserProfile(updatedUser));
    if (payload.avatar) dispatch(updatedUserAvatar(updatedUser.avatar));
  }
};

export const getUserProfile = () => (dispatch) => {
  APIHandler(dispatch, UserAPI.getUserProfile()
  .then((userInfo) => {
    dispatch(updatedUserProfile(userInfo));
  }));
};

export const updateMembership = token => (dispatch) => {
  APIHandler(dispatch, UserAPI.postMembership(token)
  .then((response) => {
    const userInfo = response.user;
    dispatch(updatedUserProfile(userInfo));
    dispatch(startLoading(false));
    // localStorage.setItem('currentUser', JSON.stringify(userInfo));
  }));
};

export const cancelSubscription = () => (dispatch) => {
  APIHandler(dispatch, UserAPI.cancelSubscription()
  .then((response) => {
    const userInfo = response.user;
    dispatch(updatedUserProfile(userInfo));
    dispatch(startLoading(false));
    // localStorage.setItem('currentUser', JSON.stringify(userInfo));
  }));
};

export const fetchExternalLinksBegin = createAction('FETCH_EXTERNAL_LINKS_BEGIN');
export const fetchExternalLinksEnd = createAction('FETCH_EXTERNAL_LINKS_END');
export const fetchExternalLinks = userId => (dispatch) => {
  dispatch(fetchExternalLinksBegin());
  async.parallel({
    types: (callback) => {
      APIHandler(dispatch, UserLinkAPI.fetchLinkTypes()
        .then(linkTypes => callback(null, linkTypes))
      );
    },
    links: (callback) => {
      APIHandler(dispatch, UserLinkAPI.fetchUserLinks(userId)
        .then(links => callback(null, links))
      );
    },
  }, (error, result) => {
    dispatch(fetchExternalLinksEnd(result));
  });
};

export const addTemporaryLink = createAction('TEMPORARY_LINK_ADD');

export const saveLinkBegin = createAction('LINK_SAVE_BEGIN');
export const saveLinkEnd = createAction('LINK_SAVE_END');
export const saveLink = (payload, link) => (dispatch) => {
  dispatch(saveLinkBegin({ linkIds: [link.id] }));
  if (link.id > 0) {
    // update edited link
    APIHandler(dispatch, UserLinkAPI.updateUserLinks(link.id, payload)
      .then((newLink) => {
        dispatch(saveLinkEnd({
          link: newLink,
        }));
      })
    );
  } else {
    // create new link
    APIHandler(dispatch, UserLinkAPI.createUserLinks(payload)
      .then((newLink) => {
        dispatch(saveLinkEnd({
          link: newLink,
          linkId: link.id,
        }));
      })
    );
  }
};

export const saveLinkOrderEnd = createAction('LINK_ORDER_SAVE_END');
export const updateLinkOrderEnd = createAction('LINK_ORDER_UPDATE_END');
export const updateLinkOrder = (payload, isSave) => (dispatch, getState) => {
  const [previousOrder, newOrder] = payload;
  const dragLink = getState().Profile.externalLink.links[previousOrder];
  const updatedLinkIds = [dragLink.id];
  if (isSave) {
    APIHandler(dispatch, UserLinkAPI.updateUserLinks(dragLink.id, { order: newOrder })
      .then((newLink) => {
        dispatch(saveLinkOrderEnd({
          link: newLink,
          newOrder,
          previousOrder,
        }));
      })
    );
  } else {
    dispatch(saveLinkOrderEnd({
      link: dragLink,
      newOrder,
      previousOrder,
    }));
  }
};


export const deleteLinkBegin = createAction('LINK_DELETE_BEGIN');
export const deleteLinkEnd = createAction('LINK_DELETE_END');
export const deleteLink = linkId => async (dispatch) => {
  dispatch(deleteLinkBegin({ linkId }));
  if (linkId > 0) {
    await APIHandler(dispatch, UserLinkAPI.deleteUserLinks(linkId));
  }
  dispatch(deleteLinkEnd({ linkId }));
};

export const updateUsernameStatus = createAction('USERNAME_STATUS_UPDATE');
export const validateUsernameBegin = createAction('VALIDATE_USERNAME_BEGIN');
export const validateUsernameEnd = createAction('VALIDATE_USERNAME_END');
export const validateUsername = username => async (dispatch) => {
  dispatch(validateUsernameBegin());
  const response = await APIHandler(dispatch,
    UserAPI.profileUsernameCheck(username),
    (code, error) => {
      dispatch(validateUsernameEnd({ error }));
    },
    [
      'ERR_USERNAME_LENGTH_TOO_SHORT',
      'ERR_USERNAME_CAN_ONLY_START_WITH_LETTER',
      'ERR_USERNAME_CONTAINS_INVALID_CHARACTER',
      'ERR_USERNAME_NOT_UNIQUE',
    ],
    undefined,
    false,
  );
  if (response === 'ok') {
    setTimeout(() => dispatch(validateUsernameEnd()), 500);
  }
};

export const connectLikeCoinBegin = createAction('LIKECOIN_CONNECT_BEGIN');
export const connectLikeCoinEnd = createAction('LIKECOIN_CONNECT_END');
export const connectLikeCoin = ({ likeCoinId }) => async (dispatch) => {
  dispatch(connectLikeCoinBegin());
  const user = await APIHandler(dispatch,
    UserAPI.connectLikeCoin({ likeCoinId }).catch((error) => {
      dispatch(connectLikeCoinEnd({ error }));
      throw error;
    }),
    null,
    [
      'ERR_LIKECOIN_CONNECT_INVALID_ID',
      'ERR_LIKECOIN_CONNECT_INVALID_ADDRESS',
      'ERR_LIKECOIN_CONNECT_MISSING_PARAMS',
      'ERR_LIKECOIN_CONNECT_DUPLICATED',
      'ERR_LIKECOIN_CONNECT_ALREADY',
    ],
  );
  dispatch(connectLikeCoinEnd({ user }));
};
