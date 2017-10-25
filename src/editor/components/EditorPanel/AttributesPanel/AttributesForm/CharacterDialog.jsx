import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';
import update from 'immutability-helper';

import ButtonGroup from 'ui-elements/ButtonGroup';
import CharacterPreview from 'ui-elements/CharacterPreview';
import * as itemKey from 'ui-elements/CharacterPreview/ItemKey';
import Checkbox from 'ui-elements/Checkbox';
import Dropdown from 'ui-elements/Dropdown';
import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';
import Tag from 'ui-elements/Tag';
import TextField from 'ui-elements/TextField';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';
import RecentUsed from 'editor/components/EditorPanel/RecentUsed';

import { DOMAIN_URL } from 'common/constants';

import AddIcon from 'common/icons/add';

import AssetSelectionModal from '../AssetSelectionModal';
import AttributeRow from '../AttributeRow';

import * as BlockAction from 'editor/actions/block';

import {
  convertAttributeDefinitions,
  getSelectedValueFromPosition,
  saveAttributeValue,
} from '../utils';

import {
  setDefaultConfigForCharacterFg,
} from 'editor/utils/app';


function getImageFromCharacterById(character, characterImageId) {
  const characterImages = _get(character, 'fgimages', []);
  return characterImages.find(characterImage => (
    characterImage.id === characterImageId
  ));
}

function getXYFromCharacterImage(character, key) {
  // set default config value when it is null
  if (!character) {
    return { x: 0, y: 0 };
  }
  // below is the character exits case
  // x for left y for right
  const config = setDefaultConfigForCharacterFg(character);
  switch (key) {
    case itemKey.Mode.left:
      return { x: config.xl, y: config.yl };
    case itemKey.Mode.middle:
      return { x: config.xm, y: config.ym };
    case itemKey.Mode.right:
      return { x: config.xr, y: config.yr };
    default:
      return { x: config.xl, y: config.yl };
  }
}

const CHARACTER_NAMES_KEY = 'OICE_CUSTOMIZED_CHARACTER_NAMES';

function loadCustomizedCharacterNames() {
  if (localStorage[CHARACTER_NAMES_KEY]) {
    const serializedCharacterNames = localStorage.getItem(CHARACTER_NAMES_KEY);
    const characterNames = JSON.parse(serializedCharacterNames);
    if (typeof characterNames === 'object') {
      return characterNames;
    }
  }
  return {};
}

function getStoryCustomizedCharacterNames(storyId) {
  const characterNames = loadCustomizedCharacterNames();
  return characterNames[storyId] || {};
}

function saveStoryCustomizedCharacterNames(storyId, names) {
  const characterNames = loadCustomizedCharacterNames();
  characterNames[storyId] = names;
  localStorage.setItem(
    CHARACTER_NAMES_KEY,
    JSON.stringify(characterNames)
  );
}

function getStateFromProps(props) {
  const { attributes, storyId } = props.block;
  return {
    definitions: convertAttributeDefinitions(props.attributesDefList),
    selectedCharacterFgId: parseInt(_get(attributes, 'fg.value', '0'), 10),
    selectedCharacterId: parseInt(_get(attributes, 'character.value', '0'), 10),
  };
}

@translate(['editor', 'assetsManagement', 'general'])
@connect((store) => {
  const { editorPanel, libraries, stories } = store;
  const { characterDictionary, characterList } = stories;
  return {
    characterDictionary,
    characterList,
    storyId: _get(stories, 'selected.id'),
    libraries: libraries.list,
    recentUsedCharacters: editorPanel.RecentUsed[RecentUsed.Constants.CHARACTER],
  };
})
export default class CharacterDialogForm extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    libraries: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    attributesDefList: PropTypes.array,
    block: PropTypes.any,
    characterDictionary: PropTypes.object,
    characterList: PropTypes.array,
    recentUsedCharacters: PropTypes.array,
    storyId: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = getStateFromProps(props);
    this.characterNames = getStoryCustomizedCharacterNames(props.storyId);
    this.isCharacterNamesSync = true;
  }

  componentDidMount() {
    this.setDefaultCharacterNameIfNeeded();
    this.characterNamesTimer = setInterval(this.syncCharacterIfNeeded, 3000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStateFromProps(nextProps));
    if (nextProps.storyId !== this.props.storyId) {
      this.characterNames = getStoryCustomizedCharacterNames(nextProps.storyId);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedCharacterId !== this.state.selectedCharacterId) {
      this.setDefaultCharacterNameIfNeeded();
    }
  }

  componentWillUnmount() {
    if (this.openCharacterImageSelectionModalTimer) {
      clearTimeout(this.openCharacterImageSelectionModalTime);
      this.openCharacterImageSelectionModalTimer = undefined;
    }
    if (this.characterNamesTimer) {
      clearInterval(this.characterNamesTimer);
      this.characterNamesTimer = undefined;
    }
    saveStoryCustomizedCharacterNames(this.props.storyId, this.characterNames);
  }

  getSelectedCharacter() {
    const { characterDictionary } = this.props;
    const { selectedCharacterId } = this.state;
    const character = _get(characterDictionary, selectedCharacterId);
    return character;
  }

  setDefaultCharacterNameIfNeeded() {
    const character = this.getSelectedCharacter();
    if (character && character.isGeneric) {
      const { block } = this.props;
      const characterName = _get(block, 'attributes.name');
      if (!characterName) {
        const defaultName = this.characterNames[character.id] || character.name;
        this.handleAttributeUpdate(
          'name',
          block,
          defaultName,
          'string'
        );
      }
    }
  }

  handleCharacterSelectionButtonClick = () => {
    const {
      characterDictionary,
      characterList,
      dispatch,
      libraries,
      recentUsedCharacters,
      t,
    } = this.props;
    const { selectedCharacterId } = this.state;

    dispatch(AssetSelectionModal.Actions.open({
      assets: characterList,
      libraries,
      selectedAssetId: selectedCharacterId,
      recentUsedAssets: recentUsedCharacters,
      title: t('characterSelectionModal.title'),
      onSelected: this.handleCharacterSelect,
    }));
    dispatch(InteractiveTutorial.Action.achieve(['0bb9cb4']));
  }

  handleCharacterImageSelectionButtonClick = () => {
    const {
      characterDictionary,
      dispatch,
      t,
    } = this.props;
    const {
      selectedCharacterId,
      selectedCharacterFgId,
    } = this.state;

    const character = _get(characterDictionary, selectedCharacterId);
    const title = t('characterModal.imageSelectionModalTitle', {
      name: _get(character, 'name'),
    });

    dispatch(AssetSelectionModal.Actions.open({
      assets: _get(character, 'fgimages', []),
      selectedAssetId: selectedCharacterFgId,
      title,
      onSelected: this.handleCharacterImageSelect,
    }));
  }

  handleAttributeUpdate(name, block2, value, type, asset = {}) {
    const { block } = this.props;
    const updatedBlock = saveAttributeValue(
      name,
      block,
      value,
      type,
      asset
    );
    this.props.dispatch(BlockAction.updateBlockView(updatedBlock));
  }

  handleSelectedPosition = (position) => {
    // left middle right
    const { block } = this.props;
    this.handleAttributeUpdate(
      'position',
      block,
      position,
      'position'
    );
    const fliplr = block.attributes.fliplr.value;
    if (
      (position === 'right' && !fliplr) ||
      (position !== 'right' && fliplr)
    ) {
      this.handleAttributeUpdate(
        'fliplr',
        block,
        !fliplr,
        'boolean'
      );
    }
  }

  handleCharacterSelect = (selectedCharacterId) => {
    const {
      block,
      characterDictionary,
      dispatch,
    } = this.props;

    const character = _get(characterDictionary, selectedCharacterId);
    const characterImage = _get(character, 'fgimages[0]');

    this.handleAttributeUpdate(
      'character',
      block,
      selectedCharacterId.toString(),
      'character'
    );
    this.handleAttributeUpdate(
      'fg',
      block,
      characterImage.id.toString(),
      'reference',
      characterImage
    );
    this.setState({
      selectedCharacterId,
      selectedCharacterFgId: characterImage.id,
    });
    dispatch(InteractiveTutorial.Action.achieve(['83d7186']));
    dispatch(RecentUsed.Actions.push({
      asset: character,
      assetType: RecentUsed.Constants.CHARACTER,
    }));

    // If there are more than one character images, show the selection modal
    if (_get(character, 'fgimages.length', 0) > 1) {
      // Need to delay since the modal view is begin transition
      this.openCharacterImageSelectionModalTimer = setTimeout(() => {
        this.handleCharacterImageSelectionButtonClick();
      }, 500);
    }
  }

  handleCharacterImageSelect = (selectedCharacterFgId) => {
    const {
      block,
      characterDictionary,
      dispatch,
    } = this.props;
    const { selectedCharacterId } = this.state;

    const character = _get(characterDictionary, selectedCharacterId);
    const characterImage = getImageFromCharacterById(
      character,
      selectedCharacterFgId
    );

    this.handleAttributeUpdate(
      'fg',
      block,
      selectedCharacterFgId.toString(),
      'reference',
      characterImage
    );
    this.setState({ selectedCharacterFgId });
    dispatch(InteractiveTutorial.Action.achieve(['673612c']));
  }

  handleCharacterNameChange = (name) => {
    const { selectedCharacterId } = this.state;
    this.characterNames = update(this.characterNames, {
      [selectedCharacterId]: { $set: name },
    });
    this.isCharacterNamesSync = false;
  }

  syncCharacterIfNeeded = () => {
    if (!this.isCharacterNamesSync) {
      saveStoryCustomizedCharacterNames(this.props.storyId, this.characterNames);
      this.isCharacterNamesSync = true;
    }
  }

  renderCharacterPreview(block, character, t) {
    const { attributes } = block;
    const { selectedCharacterFgId } = this.state;

    const characterImage = getImageFromCharacterById(
      character,
      selectedCharacterFgId
    );
    const characterImageName = _get(characterImage, 'nameEn') || t('selectPlease');
    const locationIndex = getSelectedValueFromPosition(
      _get(attributes, 'position.value')
    );
    const coordinate = getXYFromCharacterImage(character, locationIndex);
    const isFlipRight = _get(attributes, 'fliplr.value', false);
    const characterThumbnail = (characterImage ?
      `${DOMAIN_URL}${characterImage.url}` : undefined
    );

    return (
      <div className="attribute-panel-row">
        {!!character && <CharacterPreview
          image={characterThumbnail}
          x={coordinate.x}
          y={coordinate.y}
          flipped={isFlipRight}
          readonly
        />}
        <Dropdown
          staticLabel={
            _get(character, 'name', t('characterModal.selectedCharacter'))
          }
          fullWidth
          onClick={this.handleCharacterSelectionButtonClick}
        />
        {character &&
          <Dropdown
            staticLabel={characterImageName}
            fullWidth
            onClick={this.handleCharacterImageSelectionButtonClick}
          />
        }
      </div>
    );
  }

  render() {
    const { block, characterDictionary, t } = this.props;
    const { definitions, selectedCharacterId } = this.state;

    const character = this.getSelectedCharacter();
    const isGenericCharacter = _get(character, 'isGeneric', false);

    return (
      <div className="attribute-form-character-dialog">
        {this.renderCharacterPreview(block, character, t)}
        <hr />
        {isGenericCharacter &&
          <AttributeRow
            attributeDef={definitions.name}
            block={block}
            onChange={this.handleCharacterNameChange}
          />
        }
        {isGenericCharacter && <hr />}
        <AttributeRow.Group>
          <AttributeRow
            attributeDef={definitions.position}
            block={block}
            onChange={this.handleSelectedPosition}
          />
          <AttributeRow
            attributeDef={definitions.fliplr}
            block={block}
          />
        </AttributeRow.Group>
        <hr />
        <AttributeRow
          attributeDef={definitions.dialog}
          block={block}
        />
        <hr />
        <AttributeRow.Group>
          <AttributeRow
            attributeDef={definitions.fgexit}
            block={block}
            fullWidth={false}
          />
          <AttributeRow
            attributeDef={definitions.waitse}
            block={block}
            fullWidth={false}
          />
          <AttributeRow
            attributeDef={definitions.hidedialog}
            block={block}
            fullWidth={false}
          />
        </AttributeRow.Group>
      </div>
    );
  }
}
