import { createAction } from 'redux-actions';

export const toggle = createAction('TOGGLE_AUDIO_UPLOAD_MODAL');
export const addAudioFiles = createAction('ADD_AUDIO_FILES');
export const removeAudioFile = createAction('REMOVE_AUDIO_FILE');
export const transcodedAudioFile = createAction('AUDIO_FILE_TRANSCODED');
export const didAddBGMs = createAction('ADD_MULTIPLE_BGM');
export const didAddSEs = createAction('ADD_MULTIPLE_SE');
export const onError = createAction('ADD_AUDIO_UPLOaD_ERROR');
