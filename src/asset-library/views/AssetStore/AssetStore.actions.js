import { createAction } from 'redux-actions';
import { replace } from 'react-router-redux';

import _get from 'lodash/get';

import * as StoreAPI from 'common/api/store';
import { APIHandler } from 'common/utils/api';

import {
  LIBRARY_TYPE,
  LIBRARY_TYPES,
  STORE_LIBRARY_LIST,
  STORE_LIBRARY_LIST_TYPE,
} from 'asset-library/constants';
import * as PurchasedDashboardActions from 'asset-library/views/PurchasedLibraryDashboard/PurchasedLibraryDashboard.actions';


export const fetchStoreLibrariesBegin = createAction('FETCH_STORE_LIBRARIES_BEGIN');
export const fetchStoreLibrariesEnd = createAction('FETCH_STORE_LIBRARIES_END');
export const fetchStoreLibraries = (offset, limit) => (dispatch) => {
  dispatch(fetchStoreLibrariesBegin());
  APIHandler(dispatch,
    StoreAPI.fetchLibraries({ offset, limit })
      .then((response) => {
        dispatch(fetchStoreLibrariesEnd(response));
      })
  );
};

export const fetchStoreLibrariesByCollectionBegin = createAction(
  'FETCH_STORE_LIBRARIES_BY_COLLECTION_BEGIN'
);
export const fetchStoreLibrariesByCollectionEnd = createAction(
  'FETCH_STORE_LIBRARIES_BY_COLLECTION_END'
);
export const fetchStoreLibrariesByCollection = payload => (dispatch) => {
  dispatch(fetchStoreLibrariesByCollectionBegin());
  APIHandler(dispatch,
    StoreAPI.fetchLibraries(payload)
      .then((response) => {
        if (response.libraries && response.libraries.length === 0) {
          // redirect to featured if no libraries is in the list
          dispatch(replace('/store/collection/featured'));
        }
        dispatch(fetchStoreLibrariesByCollectionEnd(response));
      })
  );
};
