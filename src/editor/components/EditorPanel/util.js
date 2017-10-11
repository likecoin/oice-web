export const getComposedToBeSavedBlocks = (blockIdsToBeSavedSet, blocksDict) => {
  const blocksToBeSavedArray = [];
  if (blockIdsToBeSavedSet.size > 0) {
    blockIdsToBeSavedSet.forEach((block_id) => {
      const block = blocksDict[block_id];
      if (!block) return; // handle when block is deleted but needs to be updated at the same time
      const block_attributes = block.attributes;
      const blockObjectToSaved = {};
      blockObjectToSaved.blockId = block_id;
      blockObjectToSaved.attributes = block_attributes;
      blocksToBeSavedArray.push(blockObjectToSaved);
    });
  }
  return blocksToBeSavedArray;
};
