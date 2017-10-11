import { createAction } from 'redux-actions';

export const toggle = createAction('TOGGLE_EDIT_AUDIO_ASSET_MODAL');
export const didUpdateBGM = createAction('UPDATE_BGM');
export const didDeleteBGM = createAction('DELETE_BGM');
export const didUpdateSE = createAction('UPDATE_SE');
export const didDeleteSE = createAction('DELETE_SE');
