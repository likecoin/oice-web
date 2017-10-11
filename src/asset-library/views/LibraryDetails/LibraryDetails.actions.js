import { createAction } from 'redux-actions';
import { goBack, replace } from 'react-router-redux';

import * as AssetAPI from 'common/api/asset';
import * as CharacterAPI from 'common/api/character';
import * as LibraryAPI from 'common/api/library';
import * as StoreAPI from 'common/api/store';
import { APIHandler } from 'common/utils/api';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { LIBRARY_TYPE } from 'asset-library/constants';

import { actions as BackgroundModalActions } from 'asset-library/views/BackgroundModal';
import { actions as ItemModalActions } from 'asset-library/views/ItemModal';
import { actions as UploadAudioAssetModalActions } from 'asset-library/views/UploadAudioAssetModal';
import { actions as EditAudioAssetModalActions } from 'asset-library/views/EditAudioAssetModal';
import { actions as LibraryDashboardActions } from 'asset-library/views/LibraryDashboard';
import { actions as CreateLibraryModalActions } from 'asset-library/views/CreateLibraryModal';

import * as UserAction from 'common/actions/user';

import * as CommonActions from './LibraryDetails.common.actions';


export const fetchLibraryDetailsBegin = createAction('FETCH_LIBRARY_DETAILS_BEGIN');
export const fetchLibraryDetailsEnd = createAction('FETCH_LIBRARY_DETAILS_END');
export const fetchLibraryDetails = id => (dispatch) => {
  dispatch(fetchLibraryDetailsBegin());
  APIHandler(
    dispatch,
    LibraryAPI.fetchLibrary(id).then((library) => {
      dispatch(fetchLibraryDetailsEnd({ library }));
    })
  );
};

export const updatedLibraryAssetCount = createAction('UPDATED_LIBRARY_ASSET_COUNT');
export const updateLibraryAssetCount = ({ assetCount, libraryId }) => (dispatch, getState) => {
  const currentLibrary = getState().LibraryDetails.library;
  const newAssetCount = currentLibrary.assetCount + assetCount;
  if (newAssetCount === 0 && currentLibrary.launchedAt && currentLibrary.price > 0) {
    // for sale library should not be on store without assets
    const newLibrary = {
      ...currentLibrary,
      isLaunched: false,
    };
    dispatch(CreateLibraryModalActions.updateLibrary(newLibrary));
  }
  dispatch(updatedLibraryAssetCount({
    assetCount: newAssetCount,
    libraryId,
  }));
};

export const fetchStoreLibraryDetailsBegin = createAction('FETCH_STORE_LIBRARY_DETAILS_BEGIN');
export const fetchStoreLibraryDetailsEnd = createAction('FETCH_STORE_LIBRARY_DETAILS_END');
export const fetchStoreLibraryDetails = id => (dispatch) => {
  dispatch(fetchStoreLibraryDetailsBegin());
  APIHandler(
    dispatch,
    StoreAPI.fetchLibraryDetails(id).then((library) => {
      dispatch(fetchStoreLibraryDetailsEnd({ library }));
    })
  );
};

export const fetchLibraryAssetsByTypeBegin = createAction('FETCH_LIBRARY_ASSETS_BY_TYPE_BEGIN');
export const fetchLibraryAssetsByTypeEnd = createAction('FETCH_LIBRARY_ASSETS_BY_TYPE_END');
export const fetchLibraryAssetsByType = (id, type) => (dispatch) => {
  dispatch(fetchLibraryAssetsByTypeBegin({ type }));

  return APIHandler(
    dispatch,
    type === ASSET_TYPE.CHARACTER ? (
      CharacterAPI.fetchByLibrary(id).then((items) => {
        dispatch(fetchLibraryAssetsByTypeEnd({ type, items }));
        return { type, items };
      })
    ) : (
      AssetAPI.fetchTypedAssetsListByLibrary(id, type).then((items) => {
        dispatch(fetchLibraryAssetsByTypeEnd({ type, items }));
        return { type, items };
      })
    )
  );
};

export const fetchStoreLibraryAssetsByTypeBegin = createAction('FETCH_STORE_LIBRARY_ASSETS_BY_TYPE_BEGIN');
export const fetchStoreLibraryAssetsByTypeEnd = createAction('FETCH_STORE_LIBRARY_ASSETS_BY_TYPE_END');
export const fetchStoreLibraryAssetsByType = (id, type) => (dispatch) => {
  dispatch(fetchStoreLibraryAssetsByTypeBegin({ type }));
  return APIHandler(
    dispatch,
    StoreAPI.fetchLibraryAssetsByType(id, type).then((items) => {
      dispatch(fetchStoreLibraryAssetsByTypeEnd({ type, items }));
      return { type, items };
    })
  );
};


export const purchaseLibraryBegin = createAction('PURCHASE_LIBRARY_BEGIN');
export const purchaseLibraryEnd = createAction('PURCHASE_LIBRARY_END');
export const purchaseLibrary = (id, token) => (dispatch, getState) => {
  dispatch(purchaseLibraryBegin());
  APIHandler(
    dispatch,
    StoreAPI.purchaseLibrary(id, token).then((library) => {
      dispatch(purchaseLibraryEnd(library));
      if (token) {
        const { user } = getState();
        if (!user.hasPaymentInfo) {
          dispatch(UserAction.updateUser({ ...user, hasPaymentInfo: true }));
        }
      }
      dispatch(LibraryDashboardActions.fetchLibraries([LIBRARY_TYPE.SELECTED, LIBRARY_TYPE.UNSELECTED]));
    })
  );
};


export const didClose = createAction('DID_CLOSE_LIBRARY_DETAILS');
export const close = () => (dispatch) => {
  dispatch(goBack());
  dispatch(didClose());
};


/*
 * Assets Related
 */

export const addAsset = (meta, file, assetType) => (dispatch) => {
  switch (assetType) {
    case ASSET_TYPE.BACKGROUND: dispatch(BackgroundModalActions.willAdd()); break;
    case ASSET_TYPE.ITEM: dispatch(ItemModalActions.willAdd()); break;
    default: break;
  }
  APIHandler(dispatch,
   AssetAPI.addAsset(meta, file, assetType)
   .then(asset => {
     const { libraryId } = asset;
     dispatch(updateLibraryAssetCount({
       assetCount: 1,
       libraryId,
     }));
     dispatch(fetchLibraryAssetsByType(libraryId, assetType)).then(type => {
       switch (assetType) {
         case ASSET_TYPE.BACKGROUND: dispatch(BackgroundModalActions.didAdd(asset)); break;
         case ASSET_TYPE.ITEM: dispatch(ItemModalActions.didAdd(asset)); break;
         default: break;
       }
     });
   })
  );
};


export const addAssets = (assets, assetType, progressHandler) => async (dispatch) => {
  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-loop-func */
  // temporary solution to make synchronous add assets
  const newAssets = [];
  let index = 0;
  for (const { meta, file } of assets) {
    const newAsset = await APIHandler(dispatch,
     AssetAPI.addAsset(meta, file, assetType, (progess) => {
       dispatch(CommonActions.updateUploadStatus({ index, progess }));
     }), () => {
       dispatch(CommonActions.addAssetsFailed(assetType));
     }, [
       'ERR_AUDIO_FORMAT_UNSUPPORTED',
       'ERR_AUDIO_TRANSCODE_FAILURE',
     ]);
    if (newAsset) newAssets.push(newAsset);
    index++;
  }

  const { libraryId } = newAssets[0];
  dispatch(updateLibraryAssetCount({
    assetCount: newAssets.length,
    libraryId,
  }));

  dispatch(fetchLibraryAssetsByType(libraryId, assetType)).then((type) => {
    switch (assetType) {
      case ASSET_TYPE.MUSIC:
        dispatch(UploadAudioAssetModalActions.didAddBGMs(newAssets));
        break;
      case ASSET_TYPE.SOUND:
        dispatch(UploadAudioAssetModalActions.didAddSEs(newAssets));
        break;
      default: break;
    }
  });
};


export const updateAsset = (meta, file) => (dispatch) => {
  dispatch(CommonActions.startUpdateAsset());
  APIHandler(dispatch, AssetAPI.updateAsset(meta, file)
 .then((asset) => {
   switch (asset.types[0].name) {
     case ASSET_TYPE.BACKGROUND:
       dispatch(BackgroundModalActions.didUpdate(asset));
       break;
     case ASSET_TYPE.ITEM:
       dispatch(ItemModalActions.didUpdate(asset));
       break;
     case ASSET_TYPE.MUSIC:
       dispatch(EditAudioAssetModalActions.didUpdateBGM(asset));
       break;
     case ASSET_TYPE.SOUND:
       dispatch(EditAudioAssetModalActions.didUpdateSE(asset));
       break;
     default:
       throw new Error('Invalid asset type');
   }
 }));
};


export const deleteAsset = ({ id, type, libraryId }) => (dispatch) => {
  APIHandler(dispatch, AssetAPI.deleteAsset(id)
  .then(() => {
    dispatch(updateLibraryAssetCount({
      assetCount: -1,
      libraryId,
    }));
    switch (type) {
      case ASSET_TYPE.BACKGROUND:
        dispatch(BackgroundModalActions.didDelete(id));
        break;
      case ASSET_TYPE.ITEM:
        dispatch(ItemModalActions.didDelete(id));
        break;
      case ASSET_TYPE.MUSIC:
        dispatch(EditAudioAssetModalActions.didDeleteBGM(id));
        break;
      case ASSET_TYPE.SOUND:
        dispatch(EditAudioAssetModalActions.didDeleteSE(id));
        break;
      default:
        throw new Error('Invalid asset type');
    }
  }));
};
