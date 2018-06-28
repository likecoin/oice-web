import { createAction } from 'redux-actions';
import update from 'immutability-helper';

import * as CharacterAPI from 'common/api/character';
import * as AssetAPI from 'common/api/asset';

import { APIHandler } from 'common/utils/api';

import { FGIMAGE } from 'common/constants/assetTypes';


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

export const postCharacter = (aCharacter, fgImages, deletedFGImageIds) => (dispatch) => {
  dispatch(postCharacterBegin());
  const adding = !aCharacter.id;
  const request = (adding) ?
    CharacterAPI.addCharacter(aCharacter) :
    CharacterAPI.updateCharacter(aCharacter);

  APIHandler(dispatch, request
    .then(({ id, libraryId }) => {
      const requests = [];

      fgImages.forEach(({ meta, file, sync }) => {
        // if (sync) return;
        const asset = update(meta, {
          characterId: { $set: id },
          libraryId: { $set: parseInt(libraryId, 10) },
        });

        if (asset.id === undefined) {
          requests.push(AssetAPI.addAsset(asset, file, FGIMAGE));
        } else {
          requests.push(AssetAPI.updateAsset(asset, file));
        }
      });

      deletedFGImageIds.forEach((assetId) => {
        requests.push(AssetAPI.deleteAsset(assetId));
      });

      return Promise.all(requests)
        .then(() => CharacterAPI.getCharacter(id)
          .then(character =>
            dispatch(adding ?
              addedCharacter(character) :
              updatedCharacter(character)
            )
          ));
    })
  );
};

export const deleteCharacter = characterId => (dispatch) => {
  dispatch(postCharacterBegin());
  APIHandler(dispatch, CharacterAPI.deleteCharacter(characterId)
    .then(() => {
      dispatch(deletedCharacter(characterId));
    })
  );
};
