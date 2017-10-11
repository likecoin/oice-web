import {
  createAction,
  handleAction,
  handleActions,
} from 'redux-actions';
import { replace } from 'react-router-redux';

import * as LibraryAPI from 'common/api/library';

// Actions
export const TOGGLE_LIBRARY_MODAL = 'TOGGLE_LIBRARY_MODAL';
export const ADD_LIBRARY = 'ADD_LIBRARY';
export const UPDATE_LIBRARY = 'UPDATE_LIBRARY';
export const DELETE_LIBRARY = 'DELETE_LIBRARY';

// Reducers
const initialState = {
  open: false,
  library: null,
};

export default handleActions({
  TOGGLE_LIBRARY_MODAL: (state, { payload }) => ({
    ...state,
    open: payload.open,
    library: payload.open ? payload.library : null,
  }),
  ADD_LIBRARY: (state, { payload }) => ({
    ...state,
    open: false,
  }),
  UPDATE_LIBRARY: (state, { payload }) => ({
    ...state,
    open: false,
  }),
  DELETE_LIBRARY: (state, { payload }) => ({
    ...state,
    open: false,
  }),
}, initialState);

// Action Creators
export const toggleLibraryModal = createAction(TOGGLE_LIBRARY_MODAL);

const addedLibrary = createAction(ADD_LIBRARY);
export const addLibrary = (library) => (dispatch) => {
  LibraryAPI.addLibrary(library)
  .then(newLibrary => {
    dispatch(addedLibrary(newLibrary));
    dispatch(replace(`library/${newLibrary.id}`));
  })
  .catch(error => {
    console.error('addLibrary %O', error);
  });
};

const updatedLibrary = createAction(UPDATE_LIBRARY);
export const updateLibrary = (library) => (dispatch) => {
  LibraryAPI.updateLibrary(library)
  .then(aLibrary => {
    dispatch(updatedLibrary(aLibrary));
  })
  .catch(error => {
    console.error('updateLibrary %O', error);
  });
};

const deletedLibrary = createAction(DELETE_LIBRARY);
export const deleteLibrary = (library) => (dispatch) => {
  LibraryAPI.deleteLibrary(library.id)
  .then(() => {
    dispatch(deletedLibrary(library));
    dispatch(replace('/libraries'));
  })
  .catch(error => {
    console.error('deleteLibrary %O', error);
  });
};
