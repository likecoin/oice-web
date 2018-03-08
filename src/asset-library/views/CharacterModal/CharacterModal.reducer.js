import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import { setDefaultConfigForCharacterFg } from 'editor/utils/app';

import {
  COORDINATE_LIST,
  COORDINATE,
  POSITIONS_LIST,
  POSITIONS,
} from 'editor/constants/character';

import * as Actions from './CharacterModal.actions';

// Utils

const minifyCharacter = (character) => {
  const minifiedCharacter = {};
  Object.keys(character).forEach((key) => {
    if (/^(id|name|isGeneric|width|height|order|config|description)$/.test(key)) {
      minifiedCharacter[key] = character[key];
    }
  });
  return minifiedCharacter;
};

// Reducers
const initialState = {
  editing: false,
  expanded: true,
  loading: false,
  open: false,
  selectedFgIndex: -1,
  selectedPosition: POSITIONS.l,

  // character object related fields
  character: {
    width: 1080,
    height: 1080,
    config: {},
    isGeneric: true,
  },
  defaultConfig: {},
  fgImages: [],
  deletedFGImageIds: [],
};

export default handleActions({
  [Actions.openCharacterModal]: (state, action) => {
    const asset = action.payload;
    const editing = asset !== undefined;

    // Convertion for update asset
    const fgImages = (!editing ?
      [...initialState.fgImages] :
      asset.fgimages.map(fgImage => ({
        meta: fgImage,
        src: fgImage.url,
        file: undefined,
        sync: true,
      })));

    const character = (!editing) ? { ...initialState.character } : minifyCharacter(asset);

    const defaultConfig = setDefaultConfigForCharacterFg(character);

    return {
      character,
      defaultConfig,
      editing,
      expanded: !editing,
      fgImages,
      open: true,
      selectedFgIndex: fgImages.length > 0 ? 0 : initialState.selectedFgIndex,
      selectedPosition: initialState.selectedPosition,
      deletedFGImageIds: [],
      loading: initialState.loading,
    };
  },
  [Actions.closeCharacterModal]: (state) => ({
    ...state,
    open: false,
  }),
  [Actions.toggleExpansionCharacterModal]: (state) => update(state, {
    expanded: { $apply: (expanded) => !expanded },
  }),
  [Actions.postCharacterBegin]: (state) => ({
    ...state,
    loading: true,
  }),
  [Actions.addedCharacter]: (state) => ({
    ...state,
    open: false,
    loading: false,
  }),
  [Actions.updatedCharacter]: (state) => ({
    ...state,
    open: false,
    loading: false,
  }),
  [Actions.deletedCharacter]: (state) => ({
    ...state,
    open: false,
    loading: false,
  }),
  [Actions.updateSelectedFgIndex]: (state, { payload }) => ({
    ...state,
    selectedFgIndex: payload.selectedFgIndex,
  }),
  [Actions.updateSelectedPosition]: (state, { payload }) => ({
    ...state,
    selectedPosition: payload,
  }),
  [Actions.updateCharacterConfig]: (state, { payload }) => {
    const config = { ...state.character.config };
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (isNaN(value)) {
        delete config[key];
      } else {
        config[key] = value;
      }
    });
    const newState = update(state, {
      character: {
        config: { $set: config },
      },
    });
    newState.defaultConfig = setDefaultConfigForCharacterFg(newState.character);
    return newState;
  },
  [Actions.updateCharacterSize]: (state, { payload }) => {
    const newState = update(state, {
      character: {
        $merge: payload,
      },
    });
    newState.defaultConfig = setDefaultConfigForCharacterFg(newState.character);
    return newState;
  },
  [Actions.updateCharacterKeyValue]: (state, { payload }) => {
    const { key, value } = payload;
    return update(state, {
      character: {
        [key]: { $set: value },
      },
    });
  },
  [Actions.addFGImages]: (state, { payload }) => update(state, {
    fgImages: { $push: payload },
    selectedFgIndex: { $set: (state.fgImages.length + payload.length) - 1 },
  }),
  [Actions.updateSelectedFGImage]: (state, { payload }) => update(state, {
    fgImages: {
      [state.selectedFgIndex]: {
        meta: { $merge: payload },
      },
    },
  }),
  [Actions.replaceFGImage]: (state, { payload }) => update(state, {
    fgImages: {
      [state.selectedFgIndex]: {
        $merge: payload,
      },
    },
  }),
  [Actions.deleteFGImage]: (state, { payload }) => {
    const { id } = state.fgImages[payload].meta;
    return update(state, {
      fgImages: {
        $splice: [[payload, 1]],
      },
      deletedFGImageIds: { $push: id ? [id] : [] },
    });
  },
}, initialState);
