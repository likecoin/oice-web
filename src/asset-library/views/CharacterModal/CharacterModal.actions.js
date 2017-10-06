import { createAction } from 'redux-actions';
import update from 'immutability-helper';

import * as CharacterAPI from 'common/api/character';
import * as AssetAPI from 'common/api/asset';

import { APIHandler } from 'common/utils/api';

import { CHARACTER, FGIMAGE } from 'common/constants/assetTypes';

import { actions as LibraryDetailsActions } from 'asset-library/views/LibraryDetails';


export const openCharacterModal = createAction('OPEN_CHARACTER_MODAL');
export const closeCharacterModal = createAction('CLOSE_CHARACTER_MODAL');
export const toggleExpansionCharacterModal = createAction('TOGGLE_CHARACTER_EXPANSION_PANEL');

export const updateCharacterKeyValue = createAction('UPDATE_CHARACTER_KEY_VALUE');
export const updateCharacterSize = createAction('UPDATE_CHARACTER_SIZE');

export const replaceFGImage = createAction('REPLACE_FG_IMAGE');

export const updateSelectedPosition = createAction('UPDATE_CHARACTER_POSITION_INDEX');
export const updateCharacterConfig = createAction('UPDATE_CHARACTER_POSITION_CONFIG');

export const updateSelectedFgIndex = createAction('UPDATE_SELECTED_FG_INDEX');
export const updateFgImagesWithFgImage = createAction('UPDATE_FG_IMAGES_WITH_FG_IMAGE');
export const addFGImages = createAction('ADD_NEW_FG_IMAGE_TO_CHARACTER');
export const updateSelectedFGImage = createAction('UPDATE_SELECTED_FG_IMAGE');
export const deleteFGImage = createAction('DELETE_FG_IMAGE');

export const postCharacterBegin = createAction('POST_CHARACTER_BEGIN');
export const addedCharacter = createAction('ADD_CHARACTER');
export const updatedCharacter = createAction('UPDATE_CHARACTER');
export const deletedCharacter = createAction('DELETE_CHARACTER');

export const postCharacter = (aCharacter, fgImages, deletedFGImageIds) => async (dispatch) => {
  dispatch(postCharacterBegin());
  const adding = !aCharacter.id;
  const request = (adding) ?
  CharacterAPI.addCharacter(aCharacter) :
  CharacterAPI.updateCharacter(aCharacter);

  // create or update character
  const { id, libraryId } = await APIHandler(dispatch, request);
  let assetCountChange = -deletedFGImageIds.length;

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  // temporary solution to make synchronous update / add assets
  for (const { meta, file } of fgImages) {
    const asset = update(meta, {
      characterId: { $set: id },
      libraryId: { $set: parseInt(libraryId, 10) },
    });

    if (asset.id === undefined) {
      await APIHandler(dispatch, AssetAPI.addAsset(asset, file, FGIMAGE));
      assetCountChange++;
    } else {
      await APIHandler(dispatch, AssetAPI.updateAsset(asset, file));
    }
  }
  for (const assetId of deletedFGImageIds) {
    await APIHandler(dispatch, AssetAPI.deleteAsset(assetId));
  }

  const character = await APIHandler(dispatch, CharacterAPI.getCharacter(id));
  dispatch(LibraryDetailsActions.updateLibraryAssetCount({
    assetCount: assetCountChange,
    libraryId,
  }));

  if (adding) {
    await dispatch(LibraryDetailsActions.fetchLibraryAssetsByType(character.libraryId, CHARACTER));
    dispatch(addedCharacter(character));
  } else {
    dispatch(updatedCharacter(character));
  }
};

export const deleteCharacter = ({ id, assetCount, libraryId }) => (dispatch) => {
  dispatch(postCharacterBegin());
  APIHandler(dispatch, CharacterAPI.deleteCharacter(id)
  .then(() => {
    dispatch(deletedCharacter(id));
    dispatch(
      LibraryDetailsActions.updateLibraryAssetCount({
        assetCount,
        libraryId,
      })
    );
  }));
};
