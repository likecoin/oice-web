import { handleAction, handleActions } from 'redux-actions';

import * as Actions from 'editor/actions/block';
import * as OiceActions from 'editor/actions/oice';

const initialState = {
  idsArray: [],
  blocksDict: {},
  selectedBlock: null, // set as nill! for ui convinence
  selectedLanguage: undefined,
  toBeSavedIds: new Set(),
  fetching: false,
};

export default handleActions({
  [Actions.fetchBlocksBegin]: state => ({
    ...state,
    fetching: true,
  }),
  [Actions.fetchBlocksEnd]: (state, { payload }) => {
    const { blockList, language } = payload;
    const idsArray = [];
    const blocksDict = {};
    if (blockList instanceof Array) {
      blockList.forEach((block) => {
        idsArray.push(block.id);
        blocksDict[block.id] = block;
      });
    }
    return {
      ...state,
      idsArray,
      blocksDict,
      fetching: false,
      selectedLanguage: language || state.selectedLanguage,
    };
  },
  UPDATED_BLOCKS: (state, { payload }) => ({
    ...state,
    idsArray: payload.idsArray,
  }),
  [Actions.updatedBlockView]: (state, { payload }) => {
    const block = payload;
    const blockId = block.id;
    const copyBlocksDict = { ...state.blocksDict };
    copyBlocksDict[blockId] = block;
    return ({
      ...state,
      blocksDict: copyBlocksDict,
      selectedBlock: payload,
    });
  },
  [Actions.onSelectedBlock]: (state, { payload }) => ({
    ...state,
    selectedBlock: payload.block,
  }),
  [Actions.addBlockDnD]: (state, { payload }) => {
    const newBlock = payload.block;
    const copyIdsArray = [...state.idsArray];
    const copyBlocksDict = { ...state.blocksDict };
    copyBlocksDict[newBlock.id] = newBlock;
    const { parentId } = newBlock; // 0
    if (parentId === 0) {
      copyIdsArray.splice(0, 0, newBlock.id);
    } else {
      const index = copyIdsArray.findIndex(blockId => blockId === parentId);
      copyIdsArray.splice(index + 1, 0, newBlock.id);
    }
    return ({
      ...state,
      idsArray: copyIdsArray,
      blocksDict: copyBlocksDict,
      selectedBlock: newBlock,
    });
  },
  [Actions.deletedBlock]: (state, { payload }) => {
    const id = payload;
    const copyIdsArray = [...state.idsArray];
    const copyBlocksDict = { ...state.blocksDict };
    const index = copyIdsArray.findIndex(blockId => blockId === id);
    delete copyBlocksDict[id];
    copyIdsArray.splice(index, 1);
    return ({
      ...state,
      idsArray: copyIdsArray,
      blocksDict: copyBlocksDict,
      selectedBlock: null,
    });
  },
  [Actions.addToSavingBlockQueue]: (state, { payload }) => {
    const payloadType = typeof payload;
    // how to copy a set
    const { toBeSavedIds } = state;
    if (payloadType === 'number') {
      // id
      toBeSavedIds.add(payload);
    } else {
      // id array
      const blockIds = payload;
      blockIds.forEach((blockId) => {
        toBeSavedIds.add(blockId);
      });
    }
    return ({
      ...state,
      toBeSavedIds,
    });
  },
  [Actions.removeFromSavingBlockQueue]: (state, { payload }) => {
    const payloadType = typeof payload;
    const { toBeSavedIds } = state;
    if (payloadType === 'number') {
      // id
      toBeSavedIds.delete(payload);
    } else {
      // id array
      toBeSavedIds.clear();
    }
    return ({
      ...state,
      toBeSavedIds,
    });
  },
  [OiceActions.selectedOice]: state => ({
    ...state,
    selectedBlock: null,
    toBeSavedIds: new Set(),
  }),
}, initialState);
