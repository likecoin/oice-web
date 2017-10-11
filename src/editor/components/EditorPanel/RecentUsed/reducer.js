import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import Actions from './actions';
import * as Utils from './utils';
import * as Constants from './constants';


const initialState = {
  storyId: null,
  [Constants.BG]: [],
  [Constants.ITEM]: [],
  [Constants.CHARACTER]: [],
  [Constants.BGM]: [],
  [Constants.SE]: [],
};

export default handleActions({
  [Actions.initialize]: (state, { payload }) => {
    const storyId = payload;
    if (state.storyId !== storyId) {
      const newState = { storyId };
      Constants.ASSET_TYPES.forEach((ASSET_TYPE) => {
        newState[ASSET_TYPE] = Utils.loadRecentUsedAssets(storyId, ASSET_TYPE);
      });
      return newState;
    }
    return state;
  },
  [Actions.push]: (state, { payload }) => {
    const { storyId } = state;
    const { asset, assetType } = payload;
    if (storyId && asset) {
      const updatedAssets = Utils.pushRecentUsedAssets(
        storyId,
        assetType,
        state[assetType],
        asset
      );
      return update(state, {
        [assetType]: { $set: updatedAssets },
      });
    }
    return state;
  },
}, initialState);
