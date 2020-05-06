import { createAction } from 'redux-actions';

import { push } from 'react-router-redux';
import * as LibraryAPI from 'common/api/library';
import * as CharacterAPI from 'common/api/character';
import * as AssetAPI from 'common/api/asset';

import * as ASSET_TYPE from 'common/constants/assetTypes';

import { APIHandler } from 'common/utils/api';
import * as CrispUtils from 'common/utils/crisp';

import { startSoundUpload } from './UploadAudioAssetModal/actions';


export const fetchedSelectedLibraryById = createAction('FETCH_SELECTED_LIBRARY');
export const fetchSelectedLibraryById = libraryId => (dispatch) => {
  APIHandler(dispatch, LibraryAPI.fetchLibrary(libraryId)
    .then((library) => {
      dispatch(fetchedSelectedLibraryById(library));
    })
  );
};


export const selectedLibrary = createAction('SELECT_LIBRARY');
export const selectLibrary = library => (dispatch) => {
  dispatch(push(`/library/${library.id}`));
  dispatch(selectedLibrary(library));
};


export const deselectLibrary = createAction('DESELECT_LIBRARY');


export const fetchedBackgroundsByLibraryId = createAction('FETCH_LIBRARY_BACKGROUNDS');
export const fetchItemsByLibraryBegin = createAction('FETCH_LIBRARY_ITEM_BEGIN');
export const fetchItemsByLibraryEnd = createAction('FETCH_LIBRARY_ITEM_END');
export const fetchedMusicsByLibraryId = createAction('FETCH_LIBRARY_MUSICS');
export const fetchedSoundsByLibraryId = createAction('FETCH_LIBRARY_SOUNDS');
export const fetchTypedAssetsByLibraryId = (libraryId, assetType) => (dispatch) => {
  switch (assetType) {
    case ASSET_TYPE.ITEM: dispatch(fetchItemsByLibraryBegin()); break;
    default: break;
  }
  APIHandler(dispatch, AssetAPI.fetchTypedAssetsListByLibrary(libraryId, assetType)
    .then((assets) => {
      switch (assetType) {
        case ASSET_TYPE.BACKGROUND:
          dispatch(fetchedBackgroundsByLibraryId(assets));
          break;
        case ASSET_TYPE.ITEM:
          dispatch(fetchItemsByLibraryEnd(assets));
          break;
        case ASSET_TYPE.MUSIC:
          dispatch(fetchedMusicsByLibraryId(assets));
          break;
        case ASSET_TYPE.SOUND:
          dispatch(fetchedSoundsByLibraryId(assets));
          break;
        default:
          break;
      }
    })
  );
};


export const fetchedCharactersByLibraryId = createAction('FETCH_LIBRARY_CHARACTERS');
export const fetchCharactersByLibraryId = libraryId => (dispatch) => {
  APIHandler(dispatch, CharacterAPI.fetchByLibrary(libraryId)
    .then((library) => {
      dispatch(fetchedCharactersByLibraryId(library));
    })
  );
};

export const addBackgroundBegin = createAction('ADD_BACKGROUND_BEGIN');
export const addedBackground = createAction('ADD_BACKGROUND');
export const addItemBegin = createAction('ADD_ITEM_BEGIN');
export const addItemEnd = createAction('ADD_ITEM_END');
export const addAsset = (meta, file, assetType) => (dispatch) => {
  switch (assetType) {
    case ASSET_TYPE.BACKGROUND: dispatch(addBackgroundBegin()); break;
    case ASSET_TYPE.ITEM: dispatch(addItemBegin()); break;
    default: break;
  }
  APIHandler(dispatch,
    AssetAPI.addAsset(meta, file, assetType)
      .then(({ asset }) => {
        switch (assetType) {
          case ASSET_TYPE.BACKGROUND: dispatch(addedBackground(asset)); break;
          case ASSET_TYPE.ITEM: dispatch(addItemEnd(asset)); break;
          default: break;
        }

        CrispUtils.event('add_asset', {
          type: assetType,
        });
      })
  );
};


export const addedBGMs = createAction('ADD_MULTIPLE_BGM');
export const addedSEs = createAction('ADD_MULTIPLE_SE');
export const updateUploadStatus = createAction('UPDATE_UPLOAD_STATUS');
export const addAssetsFailed = createAction('ADD_MULTIPLE_ASSETS_FAILED');
export const addAssets = (assets, assetType, progressHandler) => (dispatch) => {
  dispatch(startSoundUpload(assetType));
  const requests = assets.map(({ meta, file }, index) => APIHandler(
    dispatch, AssetAPI.addAsset(meta, file, assetType, (progess) => {
      dispatch(updateUploadStatus({ index, progess }));
    }), () => {
      dispatch(addAssetsFailed(assetType));
    }, [
      'ERR_AUDIO_FORMAT_UNSUPPORTED',
      'ERR_AUDIO_TRANSCODE_FAILURE',
    ])
  );
  Promise.all(requests)
    .then((results) => {
      const newAssets = [];
      results.forEach((newAsset) => {
        if (newAsset) newAssets.push(newAsset);
      });
      switch (assetType) {
        case ASSET_TYPE.MUSIC:
          dispatch(addedBGMs(newAssets));
          break;
        case ASSET_TYPE.SOUND:
          dispatch(addedSEs(newAssets));
          break;
        default:
          break;
      }

      CrispUtils.event('add_asset', {
        type: assetType,
      });
    });
};


export const startUpdateAsset = createAction('START_UPDATE_ASSET');
export const updatedBackground = createAction('UPDATE_BACKGROUND');
export const updatedItem = createAction('UPDATE_ITEM');
export const updatedBGM = createAction('UPDATE_BGM');
export const updatedSE = createAction('UPDATE_SE');
export const updateAsset = (meta, file) => (dispatch) => {
  dispatch(startUpdateAsset());
  APIHandler(dispatch, AssetAPI.updateAsset(meta, file)
    .then((asset) => {
      switch (asset.types[0].name) {
        case ASSET_TYPE.BACKGROUND:
          dispatch(updatedBackground(asset));
          break;
        case ASSET_TYPE.ITEM:
          dispatch(updatedItem(asset));
          break;
        case ASSET_TYPE.MUSIC:
          dispatch(updatedBGM(asset));
          break;
        case ASSET_TYPE.SOUND:
          dispatch(updatedSE(asset));
          break;
        default:
          throw new Error('Invalid asset type');
      }

      CrispUtils.event('update_asset', {
        type: asset.types[0].name,
      });
    })
  );
};


export const deletedBackground = createAction('DELETE_BACKGROUND');
export const deleteItemBegin = createAction('DELETE_ITEM_BEGIN');
export const deleteItemEnd = createAction('DELETE_ITEM_END');
export const deletedBGM = createAction('DELETE_BGM');
export const deletedSE = createAction('DELETE_SE');
export const deleteAsset = ({ id, type }) => (dispatch) => {
  APIHandler(dispatch, AssetAPI.deleteAsset(id)
    .then(() => {
      switch (type) {
        case ASSET_TYPE.BACKGROUND:
          dispatch(deletedBackground(id));
          break;
        case ASSET_TYPE.ITEM:
          dispatch(deleteItemEnd(id));
          break;
        case ASSET_TYPE.MUSIC:
          dispatch(deletedBGM(id));
          break;
        case ASSET_TYPE.SOUND:
          dispatch(deletedSE(id));
          break;
        default:
          throw new Error('Invalid asset type');
      }

      CrispUtils.event('delete_asset', {
        type,
      });
    })
  );
};
