import { createAction } from 'redux-actions';

/*
 * This is the intermediate solution of redux action import deadlock
 */

export const updateUploadStatus = createAction('UPDATE_UPLOAD_STATUS');
export const addAssetsFailed = createAction('ADD_MULTIPLE_ASSETS_FAILED');
export const startUpdateAsset = createAction('START_UPDATE_ASSET');
