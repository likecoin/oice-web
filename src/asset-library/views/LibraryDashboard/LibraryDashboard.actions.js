import { createAction } from 'redux-actions';

import * as LibraryAPI from 'common/api/library';
import * as StoreAPI from 'common/api/store';
import { APIHandler } from 'common/utils/api';

import _interscetion from 'lodash/intersection';

import { LIBRARY_TYPE, LIBRARY_TYPES } from 'asset-library/constants';
import * as PurchasedDashboardActions from 'asset-library/views/PurchasedLibraryDashboard/PurchasedLibraryDashboard.actions';

export const fetchLibrariesBegin = createAction('FETCH_ASSET_LIBRARY_BEGIN');
export const fetchLibrariesEnd = createAction('FETCH_ASSET_LIBRARY_END');
export const fetchLibraries = types => (dispatch) => {
  dispatch(fetchLibrariesBegin({ types }));
  APIHandler(dispatch,
    LibraryAPI.fetchLibraries(types)
      .then((libraries) => {
        const payload = { result: {}, types };
        types.forEach(type => payload.result[type] = libraries[type]);
        dispatch(fetchLibrariesEnd(payload));
        // toggled library will request selected and unselected library list
        const isSelectedLibrary = (
          types.length === 2
          && _interscetion(types, [LIBRARY_TYPE.SELECTED, LIBRARY_TYPE.UNSELECTED]).length === 2
        );
        if (isSelectedLibrary) {
          // un-disabled the toggled library item
          dispatch(PurchasedDashboardActions.changeSelectedLibraryToUserEnd());
        }
      })
  );
};
