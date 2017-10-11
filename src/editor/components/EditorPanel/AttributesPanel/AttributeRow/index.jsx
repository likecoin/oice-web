import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import _get from 'lodash/get';

// ui-elements used in row
import Checkbox from 'ui-elements/Checkbox';
import SliderBar from 'ui-elements/SliderBar';
import ColorPicker from 'ui-elements/ColorPicker';
import ButtonGroup from 'ui-elements/ButtonGroup';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';
import Dropdown from 'ui-elements/Dropdown';
import Tag from 'ui-elements/Tag';
import CharacterPreview from 'ui-elements/CharacterPreview';
import ResizedImage from 'ui-elements/ResizedImage';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import * as itemKey from 'ui-elements/CharacterPreview/ItemKey';
import * as BlockAction from 'editor/actions/block';
import { DOMAIN_URL } from 'common/constants';

import AttributeRowGroup from './Group';
import OptionAttributePanel from './OptionAttributePanel';
import {
  saveAttributeValue,
  getSelectedValueFromPosition,
} from '../utils';


const NUM_SE_BUFFERS = 3;

const getIntegerFromString = (string, max, min = 0) => {
  const parsedValue = parseInt(string, 10);
  if (isNaN(parsedValue)) return min;

  if (max && parsedValue > max) return max;
  if (parsedValue < min) return min;

  return parsedValue;
};

@translate(['macro', 'editor', 'attributesPanel', 'assetsManagement'])
@connect(store => ({
  isTutorialOpen: store.interactiveTutorial.open,
}))
export default class AttributeRow extends React.Component {
  static Group = AttributeRowGroup;

  static defaultProps = {
    fullWidth: true,
    half: false,
  }

  static propTypes = {
    attributeDef: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    block: PropTypes.object,
    className: PropTypes.string,
    fullWidth: PropTypes.bool,
    id: PropTypes.string,
    isTutorialOpen: PropTypes.bool,
    selectedBackgroundImage: PropTypes.object,
    onChange: PropTypes.func,
    onClickImageSelectionModal: PropTypes.func,
  }

  componentWillUnmount() {
    if (this.tutorialAchievedTimer) {
      clearTimeout(this.tutorialAchievedTimer);
    }
  }

  getAssetType(type) {
    return type || 'text';
  }

  handleUpdateAttribute = (value, type) => {
    const {
      attributeDef,
      block,
      dispatch,
      isTutorialOpen,
      onChange,
    } = this.props;

    if (onChange) onChange(value, type);

    const updatedBlock = saveAttributeValue(
      attributeDef.name,
      block,
      value,
      type
    );
    dispatch(BlockAction.updateBlockView(updatedBlock));

    if (
      isTutorialOpen &&
      block.macroName === 'characterdialog' &&
      type === 'paragraph' &&
      value.length > 0
    ) {
      if (this.tutorialAchievedTimer) {
        clearTimeout(this.tutorialAchievedTimer);
        this.tutorialAchievedTimer = null;
      }
      this.tutorialAchievedTimer = setTimeout(() => {
        if (this.textField) this.textField.blur();
        dispatch(InteractiveTutorial.Action.achieve(['c494af6']));
        this.tutorialAchievedTimer = null;
      }, 2000);
    }
  }

  handlePositionAttributeUpdate = (value) => {
    // 0 left 1 middle 2 right
    let realValue = '';
    switch (value) {
      case itemKey.Mode.middle:
        realValue = 'middle';
        break;
      case itemKey.Mode.right:
        realValue = 'right';
        break;
      default:
        realValue = 'left';
        break;
    }
    this.handleUpdateAttribute(realValue);
  }

  handleAudioChannelAttributeUpdate = (index) => {
    this.handleUpdateAttribute(index);
  }

  renderNumberInput(assetType, attributeValue) {
    const { fullWidth } = this.props;
    const max = parseInt(assetType.substring(6), 10);
    const valueInt = parseInt(attributeValue, 10);
    return (
      <SliderBar
        fullWidth={fullWidth}
        initialVal={(valueInt || valueInt === 0) ? valueInt : 0}
        max={isNaN(max) ? 10000 : max}
        onChange={this.handleUpdateAttribute}
      />
    );
  }

  renderAudioChannelInput(assetType, attributeValue) {
    const selectedIndex = getIntegerFromString(
      attributeValue,
      NUM_SE_BUFFERS - 1, 0
    );
    const buttons = [];
    for (let i = 1; i <= NUM_SE_BUFFERS; i++) {
      buttons.push(<RaisedButton key={i} label={i} mini />);
    }

    return (
      <ButtonGroup
        fullWidth={this.props.fullWidth}
        selectedIndex={selectedIndex === -1 ? 0 : selectedIndex}
        selectable
        onChange={this.handleAudioChannelAttributeUpdate}
      >
        {buttons}
      </ButtonGroup>
    );
  }

  renderReferenceAttributeRow() {
    const {
      attributeDef,
      fullWidth,
      onClickImageSelectionModal,
      selectedBackgroundImage,
      block,
    } = this.props;
    let imageURL = '';
    const attributeName = attributeDef.name;
    const attribute = block.attributes[attributeName] || {};
    switch (attributeDef.assetType.name) {
      case 'bgimage': {
        let asset = {};
        if (selectedBackgroundImage.url) {
          asset = selectedBackgroundImage;
        } else {
          asset = attribute.asset || {};
        }
        if (asset.url) {
          imageURL = `${DOMAIN_URL}${asset.url}`;
        } else {
          imageURL = '';
        }
        return (
          <div>
            <ResizedImage src={imageURL} width={319} />
            <Dropdown
              fullWidth={fullWidth}
              staticLabel={asset.name || ''}
              onClick={onClickImageSelectionModal}
            />
          </div>
        );
      }
      default:
        return null;
    }
  }

  render() {
    const {
      attributeDef,
      block,
      fullWidth,
      id,
      t,
    } = this.props;
    if (!attributeDef) return null;

    const assetType = this.getAssetType(attributeDef.type);
    const attributeName = attributeDef.name;
    const isRequired = attributeDef.required;
    let attributeValue = _get(block, `attributes.${attributeName}.value`, '');
    let attributeLabel = t(`${block.macroName}.${attributeName}`);

    const className = classNames(
      'attribute-panel-row',
      `attribute-${assetType}`,
      {
        half: !fullWidth,
      },
      this.props.className
    );

    let showLabel = true;

    const getAttributeInput = () => {
      switch (assetType) {
        case 'boolean':
          showLabel = false;
          if (attributeValue === '') {
            attributeValue = false;
          }
          return (
            <Checkbox
              isChecked={attributeValue}
              label={attributeLabel}
              value={attributeLabel}
              onChange={(value) => this.handleUpdateAttribute(value, assetType)}
            />
          );
        case 'color':
          return (
            <ColorPicker color={attributeValue || '#4a4a4a'} onChange={(value) => this.handleUpdateAttribute(value, assetType)} />
          );
        case 'composedAnswer':
          return (
            <OptionAttributePanel
              answerOptions={attributeValue || JSON.stringify([{ target: '', content: '' }, { target: '', content: '' }])}
              attributeName={attributeName}
              block={block}
              fullWidth={fullWidth}
            />
          );
        case 'number':
        case 'number100':
        case 'number255':
          if (attributeName === 'buf') {
            return this.renderAudioChannelInput(assetType, attributeValue);
          }
          return this.renderNumberInput(assetType, attributeValue);
        case 'paragraph': {
          showLabel = false;
          let paragraphAttributePlaceHolder = t(`${block.macroName}.${attributeName}Placeholder`);
          if (isRequired) {
            paragraphAttributePlaceHolder = `${paragraphAttributePlaceHolder}(${t('requiredField')})`;
          }
          return (
            <TextField
              fullWidth={fullWidth}
              maxLength={300}
              placeholder={paragraphAttributePlaceHolder}
              ref={ref => this.textField = ref}
              value={attributeValue}
              multiLine
              showCharactersCount
              onChange={(value) => this.handleUpdateAttribute(value, assetType)}
            />
          );
        }
        case 'position':
          return (
            <ButtonGroup
              fullWidth={fullWidth}
              selectedIndex={getSelectedValueFromPosition(attributeValue)}
              selectable
              onChange={this.handlePositionAttributeUpdate}
            >
              <RaisedButton label={t('character:coordinate.left')} mini />
              <RaisedButton label={t('character:coordinate.middle')} mini />
              <RaisedButton label={t('character:coordinate.right')} mini />
            </ButtonGroup>
          );
        case 'reference':
          return (
            <div className="background">
              {this.renderReferenceAttributeRow()}
            </div>
          );
        case 'string':
          switch (attributeName) {
            case 'from':
            case 'method':
            case 'stay':
              return null;
            default:
              return (
                <TextField
                  fullWidth={fullWidth}
                  placeholder={t('stringTypeAttributePlaceholder')}
                  ref={ref => this.textField = ref}
                  value={attributeValue}
                  onChange={(value) => this.handleUpdateAttribute(value, assetType)}
                />
              );
          }
        default:
          return null;
      }
    };
    if (isRequired) { attributeLabel = `${attributeLabel} (${t('requiredField')})`; }
    switch (attributeName) {
      case 'time':
      case 'waitingtime':
      case 'autoWaitTimeInterval':
      case 'delayspeed':
      case 'overlap':
        attributeLabel = t('label.hint.ms', { label: attributeLabel });
        break;
      default:
        break;
    }
    const attributeInput = getAttributeInput();
    return (
      <div {...{ id, className }}>
        {showLabel && attributeLabel && <h5>{attributeLabel}</h5>}
        {attributeInput}
      </div>
    );
  }
}
