import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import {
  actions as LibraryDetailsActions,
} from 'asset-library/views/LibraryDetails';
import * as Actions from './AssetStore.actions';

const initialState = {
  libraries: [],
  loading: false,
  pageNumber: 1,
  totalPages: 1,
  featuredLibraryList: [],
};

function handleFetchStoreLibrariesBegin(state, { payload }) {
  return {
    ...state,
    loading: true,
  };
}

function handleFetchStoreLibrariesEnd(state, { payload }) {
  // featured will return list of featured library
  const { libraries, pageNumber, totalPages, list } = payload;

  const isFinishedFetched = (state.libraries.length > 0 && list) || (state.featuredLibraryList.length > 0 && libraries);

  if (list) {
    return update(state, {
      featuredLibraryList: { $set: list },
      loading: { $set: !isFinishedFetched },
    });
  }

  return update(state, {
    libraries: { $set: libraries },
    pageNumber: { $set: pageNumber || 1 },
    totalPages: { $set: totalPages || 1 },
    loading: { $set: !isFinishedFetched },
  });
}

function handleDidPurchaseLibrary(state, { payload }) {
  const index = state.libraries.findIndex(library => library.id === payload.id);
  return update(state, {
    libraries: {
      [index]: { $set: payload },
    },
  });
}

export default handleActions({
  [Actions.fetchStoreLibrariesBegin]: handleFetchStoreLibrariesBegin,
  [Actions.fetchStoreLibrariesEnd]: handleFetchStoreLibrariesEnd,
  [Actions.fetchStoreLibrariesByCollectionBegin]: handleFetchStoreLibrariesBegin,
  [Actions.fetchStoreLibrariesByCollectionEnd]: handleFetchStoreLibrariesEnd,
  [LibraryDetailsActions.purchaseLibraryEnd]: handleDidPurchaseLibrary,
}, initialState);
