import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import * as ASSET_TYPES from 'common/constants/assetTypes';

import { actions as CharacterModalActions } from 'asset-library/views/CharacterModal';
import { actions as BackgroundModalActions } from 'asset-library/views/BackgroundModal';
import { actions as ItemModalActions } from 'asset-library/views/ItemModal';
import { actions as EditAudioAssetModalActions } from 'asset-library/views/EditAudioAssetModal';
import {
  actions as CreateLibraryModalActions,
} from 'asset-library/views/CreateLibraryModal';
import {
  actions as PurchasedDashboardActions,
} from 'asset-library/views/PurchasedLibraryDashboard';
import * as Actions from './LibraryDetails.actions.js';

export const initialAssetState = {
  items: [],
  loaded: false,
  loading: false,
};

const initialState = {
  library: null,
  loaded: false,
  loading: false,
  assets: {
    [ASSET_TYPES.CHARACTER]: initialAssetState,
    [ASSET_TYPES.BACKGROUND]: initialAssetState,
    [ASSET_TYPES.ITEM]: initialAssetState,
    [ASSET_TYPES.MUSIC]: initialAssetState,
    [ASSET_TYPES.SOUND]: initialAssetState,
  },
  purchasing: false,
};

function handleWillFetchLibraryDetails(state) {
  return update(initialState, {
    loading: { $set: true },
  });
}

function handleDidFetchLibraryDetails(state, action) {
  const { library } = action.payload;
  return update(state, {
    library: { $set: library },
    loaded: { $set: true },
    loading: { $set: false },
  });
}

function handleWillFetchLibraryAssetsByType(state, action) {
  return update(state, {
    assets: {
      [action.payload.type]: {
        loading: { $set: true },
      },
    },
  });
}

function handleDidFetchLibraryAssetsByType(state, action) {
  const { items, type } = action.payload;
  return update(state, {
    assets: {
      [type]: {
        items: { $set: items },
        loaded: { $set: true },
        loading: { $set: false },
      },
    },
  });
}

function findAssetIndex(state, type, assetId) {
  return (
    state
    .assets[type]
    .items
    .findIndex(asset => asset.id === assetId)
  );
}

function updateAsset(state, type, asset) {
  const index = findAssetIndex(state, type, asset.id);
  return update(state, {
    assets: {
      [type]: {
        items: {
          [index]: { $set: asset },
        },
      },
    },
  });
}

function deleteAsset(state, type, assetId) {
  const index = findAssetIndex(state, type, assetId);
  return update(state, {
    assets: {
      [type]: {
        items: { $splice: [[index, 1]] },
      },
    },
  });
}

function handleChangeSelectedLibraryToUserBegin(state, { payload }) {
  if (!state.library) return state;
  return update(state, {
    library: {
      isSelected: { $set: !state.library.isSelected },
    },
  });
}

function handleWillPurchaseLibrary(state) {
  return update(state, {
    purchasing: { $set: true },
  });
}

function handleDidPurchaseLibrary(state, { payload }) {
  return update(state, {
    library: { $set: payload },
    purchasing: { $set: false },
  });
}

function handleUpdatedLibraryAssetCount(state, { payload }) {
  const { assetCount } = payload;
  return update(state, {
    library: {
      assetCount: { $set: assetCount },
    },
  });
}

function handleDidUpdateLibrary(state, { payload }) {
  return update(state, {
    library: { $set: payload },
  });
}

export default handleActions({
  [Actions.fetchLibraryDetailsBegin]: handleWillFetchLibraryDetails,
  [Actions.fetchLibraryDetailsEnd]: handleDidFetchLibraryDetails,
  [Actions.fetchStoreLibraryDetailsBegin]: handleWillFetchLibraryDetails,
  [Actions.fetchStoreLibraryDetailsEnd]: handleDidFetchLibraryDetails,
  [Actions.fetchLibraryAssetsByTypeBegin]: handleWillFetchLibraryAssetsByType,
  [Actions.fetchLibraryAssetsByTypeEnd]: handleDidFetchLibraryAssetsByType,
  [Actions.fetchStoreLibraryAssetsByTypeBegin]: handleWillFetchLibraryAssetsByType,
  [Actions.fetchStoreLibraryAssetsByTypeEnd]: handleDidFetchLibraryAssetsByType,
  [Actions.purchaseLibraryBegin]: handleWillPurchaseLibrary,
  [Actions.purchaseLibraryEnd]: handleDidPurchaseLibrary,
  [Actions.updatedLibraryAssetCount]: handleUpdatedLibraryAssetCount,
  [Actions.didClose]: (state) => update(state, {
    loaded: { $set: false },
  }),
  [CharacterModalActions.updatedCharacter]: (state, { payload }) => updateAsset(
    state,
    ASSET_TYPES.CHARACTER,
    payload
  ),
  [CharacterModalActions.deletedCharacter]: (state, { payload }) => deleteAsset(
    state,
    ASSET_TYPES.CHARACTER,
    payload
  ),
  [BackgroundModalActions.didUpdate]: (state, { payload }) => updateAsset(
    state,
    ASSET_TYPES.BACKGROUND,
    payload
  ),
  [BackgroundModalActions.didDelete]: (state, { payload }) => deleteAsset(
    state,
    ASSET_TYPES.BACKGROUND,
    payload
  ),
  [ItemModalActions.didUpdate]: (state, { payload }) => updateAsset(
    state,
    ASSET_TYPES.ITEM,
    payload
  ),
  [ItemModalActions.didDelete]: (state, { payload }) => deleteAsset(
    state,
    ASSET_TYPES.ITEM,
    payload
  ),
  [EditAudioAssetModalActions.didUpdateBGM]: (state, { payload }) => updateAsset(
    state,
    ASSET_TYPES.MUSIC,
    payload
  ),
  [EditAudioAssetModalActions.didUpdateSE]: (state, { payload }) => updateAsset(
    state,
    ASSET_TYPES.SOUND,
    payload
  ),
  [EditAudioAssetModalActions.didDeleteBGM]: (state, { payload }) => deleteAsset(
    state,
    ASSET_TYPES.MUSIC,
    payload
  ),
  [EditAudioAssetModalActions.didDeleteSE]: (state, { payload }) => deleteAsset(
    state,
    ASSET_TYPES.SOUND,
    payload
  ),
  [PurchasedDashboardActions.changeSelectedLibraryToUserBegin]: handleChangeSelectedLibraryToUserBegin,
  [CreateLibraryModalActions.updatedLibrary]: handleDidUpdateLibrary,
}, initialState);
