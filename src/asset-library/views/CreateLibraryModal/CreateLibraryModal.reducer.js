import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import * as Actions from './CreateLibraryModal.actions';

const initialState = {
  open: false,
  priceTiers: undefined,
};

function handleToggleCreateLibraryModal(state) {
  return update(state, {
    open: { $set: !state.open },
  });
}

function handleLibraryModalClose(state) {
  return update(state, {
    open: { $set: false },
  });
}

export default handleActions({
  [Actions.toggleCreateLibraryModal]: handleToggleCreateLibraryModal,
  [Actions.addedLibrary]: handleLibraryModalClose,
  [Actions.updatedLibrary]: handleLibraryModalClose,
  [Actions.deletedLibrary]: handleLibraryModalClose,
  [Actions.fetchPriceTiersEnd]: (state, { payload }) => {
    let newState = state;
    newState = update(newState, {
      priceTiers: { $set: payload },
    });
    return newState;
  },
}, initialState);
