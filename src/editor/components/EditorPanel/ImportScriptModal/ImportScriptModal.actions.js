import { createAction } from 'redux-actions';
import socketio from 'socket.io-client';

import _get from 'lodash/get';

import * as OiceAPI from 'common/api/oice';
import { DOMAIN_URL } from 'common/constants';
import { APIHandler } from 'common/utils/api';

import * as BlockAction from 'editor/actions/block';
import * as AssetAction from 'editor/actions/asset';
import * as CharacterAction from 'editor/actions/character';
import * as LibraryAction from 'editor/actions/library';

import { STAGE } from './ImportScriptModal.constants';


export const open = createAction('OPEN_IMPORT_SCRIPT_MODAL');
export const close = createAction('CLOSE_IMPORT_SCRIPT_MODAL');

export const onProgress = createAction('IMPORT_SCRIPT_PROGRESS');
export const onStageChange = createAction('IMPORT_SCRIPT_CHANGE_STAGE');
export const onError = createAction('IMPORT_SCRIPT_ERROR');

export const importScript = (oice, scriptFile) => async (dispatch, getState) => {
  dispatch(onStageChange(STAGE.UPLOADING));
  const language = _get(getState(), 'blocks.selectedLanguage');
  try {
    const jobId = await APIHandler(
      dispatch,
      OiceAPI.importScript({
        oiceId: oice.id,
        language: language || oice.language,
        scriptFile,
        progressCallback: (event) => {
          dispatch(onProgress(event.percent));
        },
      }),
      null,
      [
        'ERR_IMPORT_SCRIPT_FILE_NOT_FOUND',
        'ERR_IMPORT_SCRIPT_FILE_CANNOT_OPEN',
      ],
      ({ message }) => {
        dispatch(onError({ key: message }));
      }
    );

    if (!jobId) return;

    dispatch(onStageChange(STAGE.PREPARING));

    const socket = socketio(`${DOMAIN_URL}/import`);
    socket.on('event', async (res) => {
      if (res.error) {
        socket.close();
        dispatch(onError(res));
      } else if (res.stage !== STAGE.FINISHED) {
        if (res.progress) {
          dispatch(onProgress(res.progress));
        }
        dispatch(onStageChange(res.stage));
      } else {
        socket.close();
        // Reload blocks and assets
        dispatch(onStageChange(STAGE.RELOADING));
        await Promise.all([
          dispatch(LibraryAction.fetchLibraries()),
          dispatch(CharacterAction.fetchCharacter(oice.storyId)),
          dispatch(AssetAction.fetchStoryAssetList(oice.storyId)),
          dispatch(BlockAction.fetchBlocks(oice.id)),
        ]);
        dispatch(onStageChange(STAGE.FINISHED));
      }
    });
    socket.emit('listen', jobId);
  } catch (error) {
    // Do nothing
  }
};
