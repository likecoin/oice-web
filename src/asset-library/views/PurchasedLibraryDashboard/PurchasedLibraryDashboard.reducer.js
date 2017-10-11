import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import * as Actions from './PurchasedLibraryDashboard.actions';

const initialState = {
  togglingLibraryId: undefined,
};

function updatetogglingLibraryId(state, libraryId) {
  return update(state, {
    togglingLibraryId: { $set: libraryId },
  });
}

export default handleActions({
  [Actions.changeSelectedLibraryToUserBegin]: (state, { payload }) => (
    updatetogglingLibraryId(state, payload)
  ),
  [Actions.changeSelectedLibraryToUserEnd]: (state, { payload }) => (
    updatetogglingLibraryId(state, undefined)
  ),
}, initialState);
