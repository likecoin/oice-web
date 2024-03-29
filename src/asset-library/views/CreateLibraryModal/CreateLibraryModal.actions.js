import { createAction } from 'redux-actions';
import { replace } from 'react-router-redux';

import * as LibraryAPI from 'common/api/library';
import * as StoreAPI from 'common/api/store';

import { APIHandler } from 'common/utils/api';
import { logEvent } from 'common/utils/logger';

import { LIBRARY_TYPES } from 'asset-library/constants';

import { actions as LibraryDashboardActions } from 'asset-library/views/LibraryDashboard';

export const toggleCreateLibraryModal = createAction('TOGGLE_CREATE_LIBRARY_MODAL');

export const addedLibrary = createAction('ADDED_NEW_LIBRARY');
export const addLibrary = library => (dispatch) => {
  APIHandler(
    dispatch,
    LibraryAPI.addLibrary(library)
      .then((newLibrary) => {
        dispatch(addedLibrary(newLibrary));

        logEvent('add_library', {
          id: newLibrary.id,
          name: newLibrary.name,
          description: newLibrary.description,
          is_public: newLibrary.isPublic,
        });

        dispatch(LibraryDashboardActions.fetchLibraries([library.type]));
        dispatch(replace(`/asset/library/${newLibrary.id}/edit`));
      })
  );
};

export const updatedLibrary = createAction('UPDATED_LIBRARY');
export const updateLibrary = library => (dispatch) => {
  APIHandler(
    dispatch,
    LibraryAPI.updateLibrary(library)
      .then((newLibrary) => {
        dispatch(updatedLibrary(newLibrary));
      })
  );
};

export const deletedLibrary = createAction('DELETED_LIBRARY');
export const deleteLibrary = library => (dispatch) => {
  APIHandler(
    dispatch,
    LibraryAPI.deleteLibrary(library.id)
      .then(() => {
        dispatch(deletedLibrary(library));
        dispatch(replace('/asset'));
      })
  );
};

export const fetchPriceTiersEnd = createAction('FETCH_PRICE_TIERS_END');
export const fetchPriceTiers = () => (dispatch) => {
  APIHandler(
    dispatch,
    StoreAPI.fetchPriceTiers()
      .then((priceTiers) => {
        dispatch(fetchPriceTiersEnd(priceTiers));
      })
  );
};
