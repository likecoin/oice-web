import { createAction } from 'redux-actions';

export const toggle = createAction('TOGGLE_AUDIO_UPLOAD_MODAL');
export const addAudioFiles = createAction('ADD_AUDIO_FILES');
export const removeAudioFile = createAction('REMOVE_AUDIO_FILE');
export const startSoundUpload = createAction('START_SOUND_UPLOAD');
export const didAddBGMs = createAction('ADD_MULTIPLE_BGM');
export const didAddSEs = createAction('ADD_MULTIPLE_SE');
export const onError = createAction('ADD_AUDIO_UPLAOD_ERROR');
