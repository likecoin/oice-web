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

  bgImageLibraryIdSet: [],
  itemImageLibraryIdSet: [],
  SEsLibraryIdSet: [],
  BGMsLibraryIdSet: [],
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

    const bgImageLibraryIdSet = new Set();
    const itemImageLibraryIdSet = new Set();
    const BGMsLibraryIdSet = new Set();
    const SEsLibraryIdSet = new Set();

    payload.assetList.forEach((asset, index) => {
      if (asset.types[0]) {
        const type = asset.types[0].name;
        switch (type) {
          case 'bgimage':
            bgImageList.push(asset);
            bgImageDict[asset.id] = asset;
            bgImageLibraryIdSet.add(asset.libraryId);
            break;
          case 'image':
            itemImageList.push(asset);
            itemImageDict[asset.id] = asset;
            itemImageLibraryIdSet.add(asset.libraryId);
            break;
          case 'bgm':
            BGMs.push(asset);
            BGMsDict[asset.id] = index;
            BGMsLibraryIdSet.add(asset.libraryId);
            break;
          case 'se':
            SEs.push(asset);
            SEsDict[asset.id] = index;
            SEsLibraryIdSet.add(asset.libraryId);
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
      bgImageLibraryIdSet,
      itemImageLibraryIdSet,
      SEsLibraryIdSet,
      BGMsLibraryIdSet,
      loading: false,
    };
  },
}, initialState);
