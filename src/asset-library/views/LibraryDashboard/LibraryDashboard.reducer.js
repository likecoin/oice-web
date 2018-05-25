import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import {
  LIBRARY_TYPE,
  LIBRARY_TYPES,
  MY_LIBRARY_TYPES,
  PURCHASED_LIBRARY_TYPES,
} from 'asset-library/constants';

import {
  actions as PurchasedDashboardActions,
} from 'asset-library/views/PurchasedLibraryDashboard';
import {
  actions as LibraryModalActions,
} from 'asset-library/views/CreateLibraryModal';
import {
  actions as LibraryDetailsActions,
} from 'asset-library/views/LibraryDetails';
import * as Actions from './LibraryDashboard.actions.js';


export const initialLibraryState = {
  libraries: [],
  loaded: false,
  loading: false,
};

const initialState = {
  public: initialLibraryState,
  private: initialLibraryState,
  forSale: initialLibraryState,
  selected: initialLibraryState,
  unselected: initialLibraryState,

  isFetchingMyLibraries: false,
  isFetchedMyLibraries: false,
  isFetchingPurchasedLibraries: false,
  isFetchedPurchasedLibraries: false,
};

function getMyLibraryType(library) {
  let libraryType = 'public';
  if (library.price > 0) {
    libraryType = 'forSale';
  } else if (library.price < 0) {
    libraryType = 'private';
  }
  return libraryType;
}

function handleUpdatedLibrary(state, { payload }) {
  const libraryType = getMyLibraryType(payload);
  const index = state[libraryType].libraries.findIndex(library => library.id === payload.id);
  if (index === -1) {
    return state;
  }
  return update(state, {
    [libraryType]: {
      libraries: { [index]: { $set: payload } },
    },
  });
}

function handleDeletedLibrary(state, { payload }) {
  const libraryType = getMyLibraryType(payload);
  const index = state[libraryType].libraries.findIndex(library => library.id === payload.id);
  if (index === -1) {
    return state;
  }
  return update(state, {
    [libraryType]: {
      libraries: { $splice: [[index, 1]] },
    },
  });
}

function updateLibrarySelection(state, libraryId, libraryGroup, isSelected) {
  const index = state[libraryGroup].libraries.findIndex(library => library.id === libraryId);
  if (index !== -1) {
    return update(state, {
      [libraryGroup]: {
        libraries: {
          [index]: {
            isSelected: { $set: isSelected },
          },
        },
      },
    });
  }
  return state;
}

function handleUpdatedLibraryAssetCount(state, { payload }) {
  const { assetCount, libraryId } = payload;
  const types = [LIBRARY_TYPE.PUBLIC, LIBRARY_TYPE.PRIVATE, LIBRARY_TYPE.FORSALE];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const index = state[type].libraries.findIndex(library =>
      library.id === parseInt(libraryId, 10)
    );
    if (index !== -1) {
      return update(state, {
        [type]: {
          libraries: {
            [index]: {
              assetCount: { $set: assetCount },
            },
          },
        },
      });
    }
  }
  return state;
}

export default handleActions({
  [Actions.fetchLibrariesBegin]: (state, { payload }) => {
    const { types } = payload;
    let newState = state;

    const fetchState = {};
    if (types.includes(LIBRARY_TYPE.PUBLIC)) {
      fetchState.isFetchingMyLibraries = { $set: true };
    }
    if (types.includes(LIBRARY_TYPE.SELECTED)) {
      fetchState.isFetchingPurchasedLibraries = { $set: true };
    }

    types.forEach((type) => {
      newState = update(newState, {
        [type]: {
          loading: { $set: true },
        },
        ...fetchState,
      });
    });

    return newState;
  },
  [Actions.fetchLibrariesEnd]: (state, { payload }) => {
    let newState = state;
    const { types } = payload;

    const fetchState = {};
    if (types.includes(LIBRARY_TYPE.PUBLIC)) {
      fetchState.isFetchingMyLibraries = { $set: false };
      fetchState.isFetchedMyLibraries = { $set: true };
    }
    if (types.includes(LIBRARY_TYPE.SELECTED)) {
      fetchState.isFetchingPurchasedLibraries = { $set: false };
      fetchState.isFetchedPurchasedLibraries = { $set: true };
    }

    types.forEach((type) => {
      newState = update(newState, {
        [type]: {
          libraries: { $set: payload.result[type] },
          loaded: { $set: true },
          loading: { $set: false },
        },
        ...fetchState,
      });
    });
    return newState;
  },
  [PurchasedDashboardActions.changeSelectedLibraryToUserBegin]: (state, action) => {
    const libraryId = action.payload;

    let newState = state;

    newState = updateLibrarySelection(newState, libraryId, LIBRARY_TYPE.SELECTED, false);
    newState = updateLibrarySelection(newState, libraryId, LIBRARY_TYPE.UNSELECTED, true);

    return newState;
  },
  [LibraryModalActions.updatedLibrary]: handleUpdatedLibrary,
  [LibraryModalActions.deletedLibrary]: handleDeletedLibrary,
  [LibraryDetailsActions.updatedLibraryAssetCount]: handleUpdatedLibraryAssetCount,
}, initialState);
