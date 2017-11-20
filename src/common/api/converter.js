/* jshint camelcase: false */
import _mapValues from 'lodash/mapValues';

export default {
  // errors list
  convertErroredKSList(rawErroredOiceList) {
    if (rawErroredOiceList === undefined) {
      return [];
    }
    return Object.keys(rawErroredOiceList).map(ksFile => ({
      ksFile, // first.ks
      erroredBlocks: rawErroredOiceList[ksFile],
    }));
  },

  serializeAttributes(attributes) {
    return _mapValues(attributes, 'value');
  },
  // add block/duplicate block
  convertBlockToJSON(block) {
    const serialized = this.serializeAttributes(block.attributes);
    serialized.macroId = block.macroId;
    if (block.parentId) { // parentID === 0 is false
      serialized.parentId = block.parentId;
    }
    return serialized;
  },
  // save blocks
  serializedBlocksToBeSaved(blocksToBeSavedArray) {
    return blocksToBeSavedArray.map(blockToBeSaved => this.serializedBlock(blockToBeSaved));
  },
  serializedBlock(blockToBeSaved) {
    const serializeAttributes = this.serializeAttributes(blockToBeSaved.attributes);
    return {
      blockId: blockToBeSaved.blockId,
      attributes: serializeAttributes,
    };
  },
};
