import { createAction } from 'redux-actions';

export const toggleUploadAudioAssetModal = createAction('TOGGLE_AUDIO_UPLOAD_MODAL');
export const addAudioFiles = createAction('ADD_AUDIO_FILES');
export const removeAudioFile = createAction('REMOVE_AUDIO_FILE');
export const startSoundUpload = createAction('START_SOUND_UPLOAD');
