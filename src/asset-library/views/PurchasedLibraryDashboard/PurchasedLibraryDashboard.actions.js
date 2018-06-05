import { createAction } from 'redux-actions';

import * as LibraryAPI from 'common/api/library';
import { APIHandler } from 'common/utils/api';

import { actions as LibraryDashboardActions } from 'asset-library/views/LibraryDashboard';

import { LIBRARY_TYPE } from 'asset-library/constants';

export const changeSelectedLibraryToUserBegin = createAction('CHANGE_SELECTED_LIBRARY_TO_USER_BEGIN');
export const changeSelectedLibraryToUserEnd = createAction('CHANGE_SELECTED_LIBRARY_TO_USER_END');
export const addSelectedLibraryToUser = libraryId => (dispatch) => {
  dispatch(changeSelectedLibraryToUserBegin(libraryId));
  APIHandler(dispatch,
    LibraryAPI.addSelectedLibraryToUser(libraryId)
      .then((response) => {
        dispatch(LibraryDashboardActions.fetchLibraries([LIBRARY_TYPE.SELECTED, LIBRARY_TYPE.UNSELECTED]));
      })
  );
};

export const removeSelectedLibraryFromUserBegin = createAction('REMOVE_SELECTED_LIBRARY_TO_USER_BEGIN');
export const removeSelectedLibraryFromUser = libraryId => (dispatch) => {
  dispatch(changeSelectedLibraryToUserBegin(libraryId));
  APIHandler(dispatch,
    LibraryAPI.removeSelectedLibraryFromUser(libraryId)
      .then((response) => {
        dispatch(LibraryDashboardActions.fetchLibraries([LIBRARY_TYPE.SELECTED, LIBRARY_TYPE.UNSELECTED]));
      })
  );
};
