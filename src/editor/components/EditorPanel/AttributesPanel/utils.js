import * as itemKey from 'ui-elements/CharacterPreview/ItemKey';
import _keyBy from 'lodash/keyBy';

export const saveAttributeValue = (attrDefinitionName, block, value, type, asset = {}) => {
  // WARNING: HARD-CODE keys value definition type asset
  const toBeSaveBlock = { ...block };
  const { attributes } = toBeSaveBlock;
  attributes[attrDefinitionName] = {
    value,
    definition: {
      type,
    },
    asset,
  };
  return toBeSaveBlock;
};

export const getSelectedValueFromPosition = (position) => {
  switch (position) {
    case 'middle':
      return itemKey.Mode.middle;
    case 'right':
      return itemKey.Mode.right;
    default:
      return itemKey.Mode.left;
  }
};

export function convertAttributeDefinitions(definitions) {
  return _keyBy(definitions, (definition) => definition.name);
}
