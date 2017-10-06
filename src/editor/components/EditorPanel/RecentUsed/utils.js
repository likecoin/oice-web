import _uniqBy from 'lodash/uniqBy';

import * as Constants from './constants';


const getRecentUsedAssetsKey = (storyId, assetType) => (
  storyId ? `OICE_RECENT_USED_ASSETS_STORY-${storyId}_${assetType}` : undefined
);

export const loadRecentUsedAssets = (storyId, assetType) => {
  const key = getRecentUsedAssetsKey(storyId, assetType);
  if (key && localStorage[key]) {
    return JSON.parse(localStorage.getItem(key));
  }
  return [];
};

const saveRecentUsedAssets = (storyId, assetType, assets) => {
  const key = getRecentUsedAssetsKey(storyId, assetType);
  if (key && assets) {
    localStorage.setItem(key, JSON.stringify(assets));
  }
  return assets;
};

export const pushRecentUsedAssets = (storyId, assetType, assets, asset) => {
  const updatedAssets = _uniqBy([asset, ...assets], 'id');

  if (updatedAssets.length > Constants.MAX_ASSETS_COUNT) {
    updatedAssets.pop();
  }
  return saveRecentUsedAssets(storyId, assetType, updatedAssets);
};
