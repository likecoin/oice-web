import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import { setDefaultConfigForCharacterFg } from 'editor/utils/app';

import {
  COORDINATE_LIST,
  COORDINATE,
  POSITIONS_LIST,
  POSITIONS,
} from 'editor/constants/character';

import {
  addedCharacter,
  addFGImages,
  closeCharacterModal,
  deletedCharacter,
  deleteFGImage,
  openCharacterModal,
  postCharacterBegin,
  replaceFGImage,
  toggleExpansionCharacterModal,
  updateCharacterConfig,
  updateCharacterKeyValue,
  updateCharacterSize,
  updatedCharacter,
  updateSelectedFGImage,
  updateSelectedFgIndex,
  updateSelectedPosition,
} from './actions';

// Utils

const minifyCharacter = (character) => {
  const minifiedCharacter = {};
  Object.keys(character).forEach((key) => {
    if (/^(id|name[A-Z][a-z]|isGeneric|width|height|order|config)$/.test(key)) {
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
  },
  defaultConfig: {},
  fgImages: [],
  deletedFGImageIds: [],
};

export default handleActions({
  [openCharacterModal]: (state, action) => {
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
  [closeCharacterModal]: state => ({
    ...state,
    open: false,
  }),
  [toggleExpansionCharacterModal]: state => update(state, {
    expanded: { $apply: expanded => !expanded },
  }),
  [postCharacterBegin]: state => ({
    ...state,
    loading: true,
  }),
  [addedCharacter]: state => ({
    ...state,
    open: false,
    loading: false,
  }),
  [updatedCharacter]: state => ({
    ...state,
    open: false,
    loading: false,
  }),
  [deletedCharacter]: state => ({
    ...state,
    open: false,
    loading: false,
  }),
  [updateSelectedFgIndex]: (state, { payload }) => ({
    ...state,
    selectedFgIndex: payload.selectedFgIndex,
  }),
  [updateSelectedPosition]: (state, { payload }) => ({
    ...state,
    selectedPosition: payload,
  }),
  [updateCharacterConfig]: (state, { payload }) => {
    const config = { ...state.character.config };
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (Number.isNaN(Number(value))) {
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
  [updateCharacterSize]: (state, { payload }) => {
    const newState = update(state, {
      character: {
        $merge: payload,
      },
    });
    newState.defaultConfig = setDefaultConfigForCharacterFg(newState.character);
    return newState;
  },
  [updateCharacterKeyValue]: (state, { payload }) => {
    const { key, value } = payload;
    return update(state, {
      character: {
        [key]: { $set: value },
      },
    });
  },
  [addFGImages]: (state, { payload }) => update(state, {
    fgImages: { $push: payload },
    selectedFgIndex: { $set: (state.fgImages.length + payload.length) - 1 },
  }),
  [updateSelectedFGImage]: (state, { payload }) => update(state, {
    fgImages: {
      [state.selectedFgIndex]: {
        meta: { $merge: payload },
      },
    },
  }),
  [replaceFGImage]: (state, { payload }) => update(state, {
    fgImages: {
      [state.selectedFgIndex]: {
        $merge: payload,
      },
    },
  }),
  [deleteFGImage]: (state, { payload }) => {
    const { id } = state.fgImages[payload].meta;
    return update(state, {
      fgImages: {
        $splice: [[payload, 1]],
      },
      deletedFGImageIds: { $push: id ? [id] : [] },
    });
  },
}, initialState);
