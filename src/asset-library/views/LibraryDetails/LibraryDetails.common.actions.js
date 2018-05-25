import { createAction } from 'redux-actions';

import { push } from 'react-router-redux';

/*
 * This is the intermediate solution of redux action import deadlock
 */

export const updateUploadStatus = createAction('UPDATE_UPLOAD_STATUS');
export const addAssetsFailed = createAction('ADD_MULTIPLE_ASSETS_FAILED');
export const startUpdateAsset = createAction('START_UPDATE_ASSET');

export const didSetLibraryDetailsLibrary = createAction('SET_LIBRARY_DETAILS_LIBRARY');
export const setLibraryDetailsLibrary = ({ library }) => (dispatch) => {
  dispatch(didSetLibraryDetailsLibrary({ library }));
  dispatch(push(`/store/library/${library.id}`));
};
