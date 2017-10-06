import { createAction } from 'redux-actions';

import moment from 'moment';
import _get from 'lodash/get';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import * as BlockAPI from 'common/api/block';
import { APIHandler } from 'common/utils/api';
import { setOiceLastEditTime } from 'common/utils/editor';

function updateOiceLastEditTime(state) {
  const oiceId = _get(state, 'oices.selected.id');
  if (oiceId) setOiceLastEditTime(oiceId);
}

export const ADD_BLOCK_ACTION_ID = -1;

export const fetchBlocksBegin = createAction('FETCH_BLOCKS_BEGIN');
export const fetchBlocksEnd = createAction('FETCH_BLOCKS_END');

// from move up/down block
export const updateBlocksFromView = blockIdsArray => createAction('UPDATED_BLOCKS')({
  idsArray: blockIdsArray,
});
export const onSelectedBlock = createAction('SELECTED_BLOCK');
export const addBlockDnD = createAction('ADDED_BLOCK');
export const duplicatedBlock = createAction('DUPLICATED_BLOCK');
export const deletedBlock = createAction('DELETED_BLOCK');
export const updatedBlockView = createAction('UPDATED_BLOCK_VIEW');
export const removeFromSavingBlockQueue = createAction('DELETED_TOBESAVEDIDS');
export const addToSavingBlockQueue = createAction('ADDED_TOBESAVEDIDS');

export const fetchBlocks = (oiceId, language) => (dispatch, getState) => {
  dispatch(fetchBlocksBegin());
  APIHandler(dispatch,
    BlockAPI.fetchBlocks(oiceId, language)
    .then((blockList) => {
      dispatch(fetchBlocksEnd({ blockList, language }));
      const oldSelectedBlock = getState().blocks.selectedBlock;
      if (oldSelectedBlock) {
        const selectedBlock = blockList.find(block => block.id === oldSelectedBlock.id);
        dispatch(onSelectedBlock({ block: selectedBlock }));
      }
    })
  );
};

export const moveBlock = (blockId, parentId) => (dispatch, getState) => {
  dispatch(addToSavingBlockQueue(blockId));
  APIHandler(dispatch,
    BlockAPI.moveBlock(blockId, parentId)
    .then((block) => {
      dispatch(removeFromSavingBlockQueue(block.id));
      updateOiceLastEditTime(getState());
      dispatch(InteractiveTutorial.Action.achieve(['5a02137']));
    })
  );
};

const getTutorialStepIdsFromAddBlock = (macroId) => {
  switch (macroId) {
    case 68: return ['a47c2b5'];
    case 78: return ['72ca1a2'];
    default: return null;
  }
};

export const addBlock = (
  oiceId,
  serializedBlock,
  isDrag
) => (dispatch) => {
  dispatch(addToSavingBlockQueue(ADD_BLOCK_ACTION_ID));
  APIHandler(dispatch, BlockAPI.addBlock(oiceId, serializedBlock, isDrag)
    .then((block) => {
      dispatch(removeFromSavingBlockQueue(ADD_BLOCK_ACTION_ID));
      const tutorialStepIds = getTutorialStepIdsFromAddBlock(block.macroId);
      if (tutorialStepIds) {
        dispatch(InteractiveTutorial.Action.achieve(tutorialStepIds));
      }
      dispatch(addBlockDnD({ block }));
    })
  );
};

export const duplicateBlock = (oiceId, serializedBlock) => dispatch => APIHandler(dispatch,
  BlockAPI.addBlock(oiceId, serializedBlock, false)
  .then(block => dispatch(addBlockDnD({ block })))
);

export const updateBlockView = block => (dispatch) => {
  dispatch(updatedBlockView(block));
  dispatch(addToSavingBlockQueue(block.id));
};

export const saveBlocks = (blocksToBeSavedArray, idsToBeSavedArray) => (dispatch, getState) => {
  // clear toBeSavedIds firstly then call api
  // cause when succeed clear the ids, during the api time, the changed would not be saved
  dispatch(removeFromSavingBlockQueue(idsToBeSavedArray));

  updateOiceLastEditTime(getState());

  const language = getState().blocks.selectedLanguage;
  APIHandler(dispatch, BlockAPI.updateBlocks(blocksToBeSavedArray, language));
};

export const updateBlock = (blockId, attributes) => dispatch => APIHandler(dispatch,
  BlockAPI.updateBlock(blockId, attributes)
  .then(block => dispatch(removeFromSavingBlockQueue(block.id)))
);

export const deleteBlock = blockId => (dispatch, getState) => {
  if (getState().blocks.toBeSavedIds.has(blockId)) return;
  dispatch(addToSavingBlockQueue(blockId));
  APIHandler(dispatch,
    BlockAPI.deleteBlock(blockId)
    .then((message) => {
      dispatch(deletedBlock(blockId));
      dispatch(removeFromSavingBlockQueue(blockId));

      updateOiceLastEditTime(getState());
    })
  );
};
