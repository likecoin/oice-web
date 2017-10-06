import { createAction } from 'redux-actions';
import * as LibraryAPI from 'common/api/library';
import * as StoryAPI from 'common/api/story';
import { toggleAlertDialog } from 'ui-elements/AlertDialog/redux';

import { APIHandler } from 'common/utils/api';


const fetchedLibraries = createAction('FETCHED_LIBRARIES');
export const fetchLibraries = () => (dispatch) => APIHandler(dispatch,
  LibraryAPI.fetchLibraries()
  .then(libraries => dispatch(fetchedLibraries(libraries)))
);


export const addedLibrary = createAction('ADDED_LIBRARY');
export const addLibrary = (newStoryName) => dispatch => APIHandler(dispatch,
  LibraryAPI.addLibrary(newStoryName)
  .then(library => dispatch(addedLibrary(library)))
);


export const deletedStory = createAction('DELETED_LIBRARY');
export const deleteLibrary = (libraryId) => dispatch => APIHandler(dispatch,
  LibraryAPI.deleteLibrary(libraryId)
  .then(() => dispatch(deletedStory(libraryId)))
);


// LIBRARIES

const fetchedLibrariesByStory = createAction('FETCH_LIBRARIES_BY_STORY');
export const fetchLibrariesByStory = (storyId) => (dispatch) => APIHandler(
  dispatch,
  LibraryAPI.fetchLibrariesByStory(storyId)
  .then(libraries => dispatch(fetchedLibrariesByStory(libraries)))
);

const addedLibraryToStory = createAction('ADD_LIBRARY_TO_STORY');
export const addLibraryToStory = (storyId, libraryId) => (dispatch) => APIHandler(
  StoryAPI.addLibraryToStory(storyId, libraryId)
  .then(() => dispatch(fetchLibrariesByStory(storyId)))
);

export const removedLibraryFromStory = createAction('REMOVE_LIBRARY_FROM_STORY');
export const removeLibraryFromStory = (storyId, libraryId) => (dispatch) => APIHandler(
  StoryAPI.removeLibraryFromStory(storyId, libraryId)
  .then(() => dispatch(fetchLibrariesByStory(storyId)))
);
