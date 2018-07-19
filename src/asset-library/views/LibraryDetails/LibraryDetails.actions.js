import { createAction } from 'redux-actions';
import { goBack, replace } from 'react-router-redux';

import socketio from 'socket.io-client';

import _get from 'lodash/get';

import * as AssetAPI from 'common/api/asset';
import * as CharacterAPI from 'common/api/character';
import * as LibraryAPI from 'common/api/library';
import * as StoreAPI from 'common/api/store';
import * as LikeCoinAPI from 'common/api/likecoin';
import { APIHandler } from 'common/utils/api';

import {
  DOMAIN_URL,
  LIKECOIN_URL,
} from 'common/constants';
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
    }).catch((error) => {
      dispatch(UserAction.updateUser({ hasPaymentInfo: false }));
      dispatch(purchaseLibraryEnd());
      throw error;
    }),
    null,
    ['ERR_LIBRARY_PURCHASE_FAILURE'],
  );
};

export const purchaseLikeCoinLibrary = library => async (dispatch) => {
  const {
    id: productId,
    discountPrice,
    price,
    name,
    description,
    cover,
  } = library;
  const amount = discountPrice || price;

  dispatch(purchaseLibraryBegin());
  const tx = await APIHandler(
    dispatch,
    LikeCoinAPI.postLikeCoinTx({
      type: 'library',
      tx: {
        amount,
        productId,
      },
    }),
    () => {
      dispatch(purchaseLibraryEnd());
    },
    [
      'ERR_LIKECOIN_ID_NOT_LINKED',
      'ERR_LIKECOIN_TX_PRODUCT_STATUS_FAILED',
      'ERR_LIKECOIN_TX_PRODUCT_PURCHASED',
    ],
  );
  if (tx.id) {
    const params = {
      name,
      description,
      image: cover,
      redirect: `${DOMAIN_URL}/likecoin/tx?id=${tx.id}`,
      payload: JSON.stringify({ txId: tx.id }),
    };
    const queryParams = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    window.location.href = `${LIKECOIN_URL}/pay/oiceltd/${amount}?${queryParams}`;
  }
};


export const didClose = createAction('DID_CLOSE_LIBRARY_DETAILS');
export const close = () => (dispatch) => {
  dispatch(goBack());
  dispatch(didClose());
};


/*
 * Assets Related
 */

const onError = (assetType, error, isAdd) => (dispatch) => {
  switch (assetType) {
    case ASSET_TYPE.MUSIC:
    case ASSET_TYPE.SOUND:
      if (isAdd) {
        dispatch(UploadAudioAssetModalActions.onError({ error }));
      } else {
        dispatch(EditAudioAssetModalActions.onError({ error }));
      }
      break;
    default:
      break;
  }
};

export const addAsset = (meta, file, assetType) => (dispatch) => {
  switch (assetType) {
    case ASSET_TYPE.BACKGROUND: dispatch(BackgroundModalActions.willAdd()); break;
    case ASSET_TYPE.ITEM: dispatch(ItemModalActions.willAdd()); break;
    default: break;
  }
  APIHandler(dispatch,
    AssetAPI.addAsset(meta, file, assetType)
      .then(({ asset }) => {
        const { libraryId } = asset;
        dispatch(updateLibraryAssetCount({
          assetCount: 1,
          libraryId,
        }));
        dispatch(fetchLibraryAssetsByType(libraryId, assetType)).then((type) => {
          switch (assetType) {
            case ASSET_TYPE.BACKGROUND: dispatch(BackgroundModalActions.didAdd()); break;
            case ASSET_TYPE.ITEM: dispatch(ItemModalActions.didAdd()); break;
            default: break;
          }
        });
      })
  );
};

const isAudioAsset = type => type === ASSET_TYPE.MUSIC || type === ASSET_TYPE.SOUND;
const getLibraryId = state => state.LibraryDetails.library.id;

const didAddAssets = assetType => (dispatch) => {
  switch (assetType) {
    case ASSET_TYPE.MUSIC:
      dispatch(UploadAudioAssetModalActions.didAddBGMs());
      break;
    case ASSET_TYPE.SOUND:
      dispatch(UploadAudioAssetModalActions.didAddSEs());
      break;
    default:
      break;
  }
};
const addAssetsEnd = (assetType, count) => (dispatch, getState) => {
  // only update view if there are any successful uploaded assets
  if (count <= 0) {
    dispatch(didAddAssets(assetType));
    return;
  }

  const libraryId = getLibraryId(getState());
  dispatch(updateLibraryAssetCount({
    assetCount: count,
    libraryId,
  }));
  dispatch(fetchLibraryAssetsByType(libraryId, assetType)).then((type) => {
    dispatch(didAddAssets(assetType));
  });
};
export const addAssets = (uploadAssets, assetType) => async (dispatch, getState) => {
  let numNewAssets = 0;
  let index = 0;
  const progressHandler = (progess) => {
    dispatch(CommonActions.updateUploadStatus({ index, progess }));
  };
  const addAssetFailureHandler = () => {
    dispatch(CommonActions.addAssetsFailed(assetType));
  };

  if (isAudioAsset(assetType)) {
    // upload multiple assets at once
    const metas = [];
    const files = [];
    uploadAssets.forEach(({ meta, file }) => {
      metas.push(meta);
      files.push(file);
    });
    const { assets, jobId } = await APIHandler(dispatch,
      AssetAPI.addAsset(metas, files, assetType, progressHandler),
      addAssetFailureHandler,
      [
        'ERR_AUDIO_FORMAT_UNSUPPORTED',
      ],
    );

    // listen to job progress
    const socket = socketio(`${DOMAIN_URL}/audio/convert`);
    socket.on('event', async (res) => {
      if (res.stage === 'transcode') {
        dispatch(UploadAudioAssetModalActions.transcodedAudioFile({
          id: res.assetId,
          error: res.error,
        }));
      } else if (res.error) {
        socket.close();
        dispatch(onError(assetType, _get(res, 'interpolation.message'), true));
      } else if (res.stage === 'finished') {
        socket.close();
        // count number of valid transcoded audios
        const newAssetCounts = getState().UploadAudioAssetModal.uploadStatus.reduce((total, status) => (
          status.error ? total : total + 1
        ), 0);
        dispatch(addAssetsEnd(assetType, newAssetCounts));
      }
    });
    socket.emit('listen', jobId);
  } else {
    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-loop-func */
    // temporary solution to add assets synchronously
    for (const { meta, file } of uploadAssets) {
      const { asset } = await APIHandler(dispatch,
        AssetAPI.addAsset(meta, file, assetType, progressHandler),
        addAssetFailureHandler,
      );
      numNewAssets++;
      index++;
    }
    dispatch(addAssetsEnd(assetType, numNewAssets));
  }
};


const updatedAsset = (assetType, asset) => (dispatch) => {
  switch (assetType) {
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
};
export const updateAsset = (meta, file, type) => async (dispatch) => {
  switch (type) {
    case ASSET_TYPE.BACKGROUND: dispatch(BackgroundModalActions.willUpdate()); break;
    case ASSET_TYPE.ITEM: dispatch(ItemModalActions.willUpdate()); break;
    default: break;
  }

  dispatch(CommonActions.startUpdateAsset());

  const { asset, jobId } = await APIHandler(dispatch, AssetAPI.updateAsset(meta, file));
  const assetType = meta.types[0].name;

  if (jobId) {
    const socket = socketio(`${DOMAIN_URL}/audio/convert`);
    socket.on('event', async (res) => {
      if (res.stage === 'transcode') {
        if (res.error) {
          dispatch(onError(assetType, res.error));
        }
      } else if (res.error) {
        socket.close();
        dispatch(onError(assetType, _get(res, 'interpolation.message'), false));
      } else if (res.stage === 'finished') {
        socket.close();
        // fetch new asset with updated audio url
        const newAsset = await APIHandler(dispatch, AssetAPI.fetchAsset(asset.id));
        dispatch(updatedAsset(assetType, newAsset));
      }
    });
    socket.emit('listen', jobId);
  } else {
    dispatch(updatedAsset(assetType, asset));
  }
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
