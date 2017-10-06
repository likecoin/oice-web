import { handleActions } from 'redux-actions';

import update from 'immutability-helper';

import _get from 'lodash/get';

import { setLocalUserItem } from 'common/utils/auth';

import * as Actions from './Profile.actions';

const defaultLink = id => ({
  typeAlias: undefined,
  label: undefined,
  link: undefined,
  id,
});

// Reducers
const initialState = {
  loading: false,
  saving: false,
  userProfile: null,
  externalLink: {
    loaded: false,
    loading: false,
    types: undefined,
    links: [],
    savingIds: [],
    deletingIds: [],
  },
  usernameStatus: {
    error: undefined,
    isValidating: false,
    isValidated: true,
  },
};

function getSavingLinkIndex(state, linkId) {
  return state.externalLink.savingIds.findIndex(id => id === linkId);
}

function getExistingLinkIndex(state, linkId) {
  return state.externalLink.links.findIndex(link => link.id === linkId);
}

export default handleActions({
  [Actions.updateUserProfileBegin]: (state, { payload }) => (
    update(state, {
      saving: { $set: true },
    })
  ),
  [Actions.updatedUserProfile]: (state, { payload }) => {
    if (payload) setLocalUserItem(payload);
    return {
      ...state,
      userProfile: payload,
      saving: false,
    };
  },
  [Actions.startLoading]: (state, { payload }) => ({
    ...state,
    loading: payload,
  }),
  [Actions.fetchExternalLinksBegin]: state => (
    update(state, {
      externalLink: { loading: { $set: true } },
    })
  ),
  [Actions.fetchExternalLinksEnd]: (state, { payload }) => (
    update(state, {
      externalLink: {
        loaded: { $set: true },
        loading: { $set: false },
        types: { $set: payload.types },
        links: { $set: payload.links },
      },
    })
  ),
  [Actions.addTemporaryLink]: (state) => {
    const { links } = state.externalLink;
    const link = links[links.length - 1];

    // set negative id for not yet added link
    const newLinkId = (!link || (link && link.id > 0)) ? -1 : link.id - 1;

    return (
      update(state, {
        externalLink: {
          links: { $push: [defaultLink(newLinkId)] },
        },
      })
    );
  },
  [Actions.saveLinkBegin]: (state, { payload }) => (
    update(state, {
      externalLink: {
        savingIds: { $push: payload.linkIds },
      },
    })
  ),
  [Actions.saveLinkEnd]: (state, { payload }) => {
    const { link, linkId } = payload;
    let externalLink;
    if (linkId) {
      // saved new link
      externalLink = update(state.externalLink, {
        savingIds: { $splice: [[getSavingLinkIndex(state, linkId), 1]] },
        links: {
          $splice: [[getExistingLinkIndex(state, linkId), 1]],
          $push: [link],
        },
      });
    } else {
      // updated new link
      externalLink = update(state.externalLink, {
        savingIds: { $splice: [[getSavingLinkIndex(state, link.id), 1]] },
        links: {
          [getExistingLinkIndex(state, link.id)]: { $set: link },
        },
      });
    }
    return update(state, {
      externalLink: { $set: externalLink },
    });
  },
  [Actions.saveLinkOrderEnd]: (state, { payload }) => (
    update(state, {
      externalLink: {
        links: {
          $splice: [
            [payload.previousOrder, 1],
            [payload.newOrder, 0, payload.link],
          ],
        },
        savingIds: { $splice: [[getSavingLinkIndex(state, payload.link.id), 1]] },
      },
    })
  ),
  [Actions.deleteLinkBegin]: (state, { payload }) => (
    update(state, {
      externalLink: {
        deletingIds: { $push: [payload.linkId] },
      },
    })
  ),
  [Actions.deleteLinkEnd]: (state, { payload }) => {
    const deletingLinkIndex = state.externalLink.deletingIds.findIndex(id => id === payload.linkId);
    const oldLinkIndex = getExistingLinkIndex(state, payload.linkId);
    return update(state, {
      externalLink: {
        links: { $splice: [[oldLinkIndex, 1]] },
        deletingIds: { $splice: [[deletingLinkIndex, 1]] },
      },
    });
  },
  [Actions.updateUsernameStatus]: (state, { payload }) => (
    update(state, {
      usernameStatus: { $merge: payload },
    })
  ),
  [Actions.validateUsernameBegin]: state => (
    update(state, {
      usernameStatus: {
        isValidating: { $set: true },
        error: { $set: undefined },
      },
    })
  ),
  [Actions.validateUsernameEnd]: (state, { payload }) => (
    update(state, {
      usernameStatus: {
        isValidating: { $set: false },
        isValidated: { $set: true },
        error: { $set: _get(payload, 'error') },
      },
    })
  ),
}, initialState);
