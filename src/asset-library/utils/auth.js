import { UserAuthWrapper } from 'redux-auth-wrapper';
import { routerActions } from 'react-router-redux';

import React from 'react';
import LoadingScreen from 'ui-elements/LoadingScreen';

export const UserLoggedIn = UserAuthWrapper({
  authSelector: state => state.user,
  failureRedirectPath: 'store',
  wrapperDisplayName: 'UserLoggedIn',
});

export const LibraryBelongsToUser = UserAuthWrapper({
  authSelector: (state) => {
    const { user, LibraryDetails } = state;
    if (user && LibraryDetails.library) {
      if (user.id !== LibraryDetails.library.author[0].id) {
        return null;
      }
    }
    return state.user;
  },
  failureRedirectPath: 'asset',
  wrapperDisplayName: 'LibraryBelongsToUser',
});
