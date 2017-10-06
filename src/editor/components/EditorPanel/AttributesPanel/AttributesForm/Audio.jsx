import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import AudioPlayer from 'ui-elements/AudioPlayer';
import Dropdown from 'ui-elements/Dropdown';
import Tag from 'ui-elements/Tag';
import SliderBar from 'ui-elements/SliderBar';
import Checkbox from 'ui-elements/Checkbox';

import * as BlockAction from 'editor/actions/block';
import * as ASSET_TYPE from 'common/constants/assetTypes';
import { getAudioMp4Url } from 'editor/utils/app';

import AudioSelectionModal from './AudioSelectModal';
import AttributeRow from '../AttributeRow';
import { saveAttributeValue } from '../utils';
import * as SELECTION_MODAL_CONSTANT from 'editor/constants/selectionModal';

import { openAudioSelectionModal } from 'editor/actions/modal';


@translate(['editor', 'macro', 'attributesPanel'])
@connect(store => ({
  BGMs: store.assets.BGMs,
  SEs: store.assets.SEs,
  libraries: store.libraries.list,
}))

export default class AudioAttributesForm extends React.Component {
  static propTypes = {
    BGMs: PropTypes.array.isRequired,
    SEs: PropTypes.array.isRequired,
    attributesDefList: PropTypes.array.isRequired,
    block: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    fullWidth: PropTypes.bool,
    libraries: PropTypes.array,
  }

  static defaultProps = {
    fullWidth: true,
  }

  handleChange = (selectedAudioAsset, attributeName) => {
    const updatedBlock = saveAttributeValue(
      attributeName,
      this.props.block,
      selectedAudioAsset.id.toString(),
      'reference',
    );
    updatedBlock.attributes.storage.asset = selectedAudioAsset;
    // updatedBlock.attributes[0].asset = selectedAudioAsset; // HARD-CODE
    this.props.dispatch(BlockAction.updateBlockView(updatedBlock));
  }

  handleOnClickAudioSelection = (type, audios, selectedAudio, attributeName) => {
    const { t } = this.props;
    if (this.audioPlayer) {
      this.audioPlayer.pauseAudio();
    }
    const title = t(`${type === ASSET_TYPE.MUSIC ? 'audioSelectionModal.title.chooseMusic' : 'audioSelectionModal.title.chooseSound'}`);
    this.props.dispatch(openAudioSelectionModal({
      libraries: this.props.libraries,
      title,
      width: 600,
      className: SELECTION_MODAL_CONSTANT.AUDIO,
      selectedAudio,
      audios,
      onSelected: (value) => this.handleChange(value, attributeName),
    }));
  }

  getAudioAssetsList() {
    const { block, BGMs, SEs } = this.props;
    if (block.macroName === 'bgm') return BGMs;
    return SEs;
  }

  renderAudioInput(index, attributeDef) {
    const { block, t } = this.props;
    const attributeName = attributeDef.name; // "storage"
    let attributeLabel = t(`${block.macroName}.${attributeName}`);
    if (attributeDef.required) {
      attributeLabel = `${attributeLabel} (${t('requiredAsset')})`;
    }
    const attribute = block.attributes[attributeName] || {};

    const selectedAudioAssetId = attribute.asset ? attribute.asset.id : 0;
    const selectedAudioAssetName = attribute.asset ? attribute.asset.nameEn : '';
    const selectedAudioAssetUrl = attribute.asset ? getAudioMp4Url(attribute.asset) : '';
    let type = '';
    if (block.macroName === ASSET_TYPE.MUSIC) {
      type = 'bgm';
    } else {
      type = 'se';
    }
    const audioList = this.getAudioAssetsList();

    const audioComponent = (
      <div
        className="attribute-panel-row"
        key={index}
      >
        {selectedAudioAssetUrl &&
          <AudioPlayer
            mode={'hiddenVolume'}
            ref={(e) => this.audioPlayer = e}
            title={selectedAudioAssetName}
            url={selectedAudioAssetUrl}
            selected
          />
        }
        <Dropdown
          staticLabel={type === ASSET_TYPE.MUSIC ?
            (selectedAudioAssetName || t('audioSelectionModal.placeholder.music')) :
            (selectedAudioAssetName || t('audioSelectionModal.placeholder.sound'))}
          fullWidth
          onClick={() => this.handleOnClickAudioSelection(
            type,
            audioList,
            attribute.asset,
            attributeName
          )}
        />
        <AudioSelectionModal />
      </div>);
    return audioComponent;
  }

  renderAttributeInputs() {
    const { block, attributesDefList } = this.props;
    const attributeInputs = [];

    if (attributesDefList && attributesDefList.constructor === Array) {
      const lastIndex = attributesDefList.length - 1;
      attributesDefList.forEach((attributeDef, index) => {
        // if (attributeDef.name === 'time' || attributeDef.name === 'overlap') {
        //   return;
        // }
        if (attributeDef.name === 'storage') {
          attributeInputs.push(this.renderAudioInput(index, attributeDef));
        } else {
          attributeInputs.push(
            <AttributeRow
              attributeDef={attributeDef}
              block={block}
              key={index}
            />
          );
        }
        if (index < lastIndex) attributeInputs.push(<hr key={`${index}-hr`} />);
      });
    }

    return attributeInputs;
  }

  render() {
    return (
      <div className="attribute-form-audio">
        {this.renderAttributeInputs()}
      </div>
    );
  }
}
