import request from 'superagent';
import socketio from 'socket.io-client';

import { createAction } from 'redux-actions';
import { push, replace } from 'react-router-redux';

import { DOMAIN_URL } from 'common/constants';
import * as OiceAPI from 'common/api/oice';
import * as BlockAPI from 'common/api/block';
import { logEvent } from 'common/utils/logger';


import {
  FETCH_SELECTED_OICE,
  FETCHED_OICES,
  SELECTED_OICE,
} from 'editor/constants/actionTypes';
import {
  LOADING,
  FAILED_ERRORS,
  FAILED,
  SUCCESS,
  VALIDATE_SUCCESS,
} from 'editor/constants/stageType';

import * as EditorPanelAction from 'editor/components/EditorPanel/actions';
import { APIHandler } from 'common/utils/api';
import { setLastEditingOice } from 'common/utils/editor';

import {
  removeFromSavingBlockQueue,
  addToSavingBlockQueue,
} from './block';


export const unselectOice = createAction('OICE_UNSELECT');
export const selectedOice = createAction(SELECTED_OICE);
export const selectOice = oice => (dispatch) => {
  setLastEditingOice(oice);
  dispatch(selectedOice(oice));
  dispatch(push(`story/${oice.storyId}/oice/${oice.id}`));
};

export const fetchOiceBegin = createAction('FETCH_OICE_BEGIN');
export const fetchedOices = createAction(FETCHED_OICES);
export const fetchOices = (storyId, language) => (dispatch) => {
  dispatch(fetchOiceBegin());
  APIHandler(dispatch, OiceAPI.fetchOices(storyId, language)
    .then(oiceList => dispatch(fetchedOices(oiceList)))
  );
};

export const fetchedSelectedOice = createAction(FETCH_SELECTED_OICE);
export const fetchSelectedOice = (oiceId, language) => dispatch => APIHandler(dispatch,
  OiceAPI.fetchOice(oiceId, language)
    .then(oice => dispatch(fetchedSelectedOice(oice)))
);


const dispatchJobState = (dispatch, id, stage, message = '', data = null) => {
  dispatch(EditorPanelAction.updateRunOiceState({
    id,
    stage,
    message, // description for stage state
    data, // data
  }));
};

const buildSocket = socketio(`${DOMAIN_URL}/build`);

export const runOice = (storyId, oiceId, savingBlocks, isPreview, jobId) => (dispatch, getState) => {
  logEvent(isPreview ? 'preview_oice' : 'build_oice', {
    story_id: storyId,
    oice_id: oiceId,
  });

  const dispatchState = (stage, message, data) => dispatchJobState(
    dispatch, jobId, stage, message, data
  );
  const validateAndBuildOice = () => {
    dispatchState(LOADING, 'validating');
    OiceAPI.validateOice(storyId, oiceId)
      .then((oiceErrors) => {
        if (oiceErrors.length === 0) {
          dispatchState(LOADING, 'building');
          OiceAPI.buildOice(storyId, oiceId, isPreview)
            .then((response) => {
              const view_url = response.url;
              const { message, code } = response;

              buildSocket.on('finished', (res) => {
                dispatchState(SUCCESS, 'buildSuccess', view_url);
              });
              buildSocket.on('failed', (res) => {
                dispatchState(FAILED, 'buildFailedUnkownError');
              });
              buildSocket.emit('set_id', oiceId);
            })
            .catch((error) => {
              dispatchState(FAILED, 'buildFailedUnkownError');
            });
        } else {
          dispatchState(FAILED_ERRORS, 'buildFailed', oiceErrors[0].erroredBlocks);
        }
      })
      .catch((error) => {
        dispatchState(FAILED, 'validateFailed');
      });
  };

  if (savingBlocks.length > 0) {
    const savingBlockIds = savingBlocks.map(({ id }) => id);
    dispatch(removeFromSavingBlockQueue(savingBlockIds));
    const language = getState().blocks.selectedLanguage;
    BlockAPI.updateBlocks(savingBlocks, language)
      .then((blocks) => {
        validateAndBuildOice();
      })
      .catch((error) => {
        dispatchState(FAILED, 'saveFailed');
        dispatch(addToSavingBlockQueue(savingBlockIds));
      });
  } else {
    validateAndBuildOice();
  }
};

const exportSocket = socketio(`${DOMAIN_URL}/export`);

export const exportOice = (storyId, oiceId, savingBlocks, jobId) => (dispatch, getState) => {
  const dispatchState = (stage, message, data) => dispatchJobState(
    dispatch, jobId, stage, message, data
  );
  const validateOice = () => {
    dispatchState(LOADING, 'validating');
    OiceAPI.validateOice(storyId, oiceId)
      .then((oiceErrors) => {
        if (oiceErrors.length === 0) {
          dispatchState(VALIDATE_SUCCESS, 'exporting');
          OiceAPI.exportOice(storyId, oiceId)
            .then((exportId) => {
              exportSocket.on('finished', (exportJob) => {
                dispatchState(SUCCESS, 'exportSuccess', exportJob.id);
              });
              exportSocket.emit('set_id', exportId);
            })
            .catch((error) => {
              dispatchState(FAILED, 'exportFailed');
            });
        } else {
          dispatchState(FAILED_ERRORS, 'validateSuccessWithError', oiceErrors[0].erroredBlocks);
        }
      })
      .catch((error) => {
        dispatchState(FAILED, 'validateFailed');
      });
  };

  if (savingBlocks.length > 0) {
    const savingBlockIds = savingBlocks.map(({ id }) => id);
    dispatch(removeFromSavingBlockQueue(savingBlockIds));
    const language = getState().blocks.selectedLanguage;
    BlockAPI.updateBlocks(savingBlocks, language)
      .then((blocks) => {
        validateOice();
      })
      .catch((error) => {
        dispatchState(FAILED, 'saveFailed');
        dispatch(addToSavingBlockQueue(savingBlocks));
      });
  } else {
    validateOice();
  }
};
