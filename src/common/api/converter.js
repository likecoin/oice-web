/* jshint camelcase: false */
import _mapValues from 'lodash/mapValues';

export default {
  // errors list
  convertErroredKSList(rawErroredOiceList) {
    if (rawErroredOiceList === undefined) {
      return [];
    }
    const erroredKSList = Object.keys(rawErroredOiceList).map((key) => {
      const errorsBody = rawErroredOiceList[key]; // errorsBody is a array
      const erroredBlocksArray = errorsBody.map((oiceError) => {
        const block = oiceError.block;
        const errors = oiceError.errors;
        const erroredBlock = {
          blockId: block.id,
          errors,
        };
        return erroredBlock;
      });
      return {
        OiceName: key, // first.ks
        erroredBlocks: erroredBlocksArray,
      };
    });
    return erroredKSList;
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
