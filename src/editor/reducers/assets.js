import { handleAction, handleActions } from 'redux-actions';
import _keyBy from 'lodash/keyBy';

import {
  fetchStoryAssetsBegin,
  fetchStoryAssetsEnd,
} from 'editor/actions/asset';


const initialState = {
  bgImageDict: {},
  bgImageList: [],
  itemImageList: [],
  itemImageDict: {},
  BGMs: [],
  BGMsDict: {},
  SEs: [],
  SEsDict: {},
  typeList: [],
  loading: false,
};

export default handleActions({
  [fetchStoryAssetsBegin]: state => ({
    ...state,
    loading: true,
  }),
  [fetchStoryAssetsEnd]: (state, { payload }) => {
    const bgImageList = [];
    const bgImageDict = {};
    const itemImageList = [];
    const itemImageDict = {};
    const BGMs = [];
    const BGMsDict = {};
    const SEs = [];
    const SEsDict = {};

    payload.assetList.forEach((asset, index) => {
      if (asset.types[0]) {
        const type = asset.types[0].name;
        switch (type) {
          case 'bgimage':
            bgImageList.push(asset);
            bgImageDict[asset.id] = asset;
            break;
          case 'image':
            itemImageList.push(asset);
            itemImageDict[asset.id] = asset;
            break;
          case 'bgm':
            BGMs.push(asset);
            BGMsDict[asset.id] = index;
            break;
          case 'se':
            SEs.push(asset);
            SEsDict[asset.id] = index;
            break;
          default:
            break;
        }
      }
    });
    return {
      ...state,
      bgImageList,
      bgImageDict,
      itemImageList,
      itemImageDict,
      BGMs,
      BGMsDict,
      SEs,
      SEsDict,
      loading: false,
    };
  },
}, initialState);
