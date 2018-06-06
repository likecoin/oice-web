import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import AudioPlayer from 'ui-elements/AudioPlayer';
import Checkbox from 'ui-elements/Checkbox';
import Dropdown from 'ui-elements/Dropdown';
import Tag from 'ui-elements/Tag';
import SliderBar from 'ui-elements/SliderBar';

import RecentUsed from 'editor/components/EditorPanel/RecentUsed';

import * as BlockAction from 'editor/actions/block';
import * as ASSET_TYPE from 'common/constants/assetTypes';
import { getAudioMp4Url } from 'editor/utils/app';

import * as SELECTION_MODAL_CONSTANT from 'editor/constants/selectionModal';
import AudioSelectionModal from './AudioSelectModal';
import AttributeRow from '../AttributeRow';
import { saveAttributeValue } from '../utils';

import { openAudioSelectionModal } from 'editor/actions/modal';

const { SE, BGM } = RecentUsed.Constants;

function getAssetType(block) {
  return block.macroName;
}

function isBGM(block) {
  return getAssetType(block) === BGM;
}

@translate(['editor', 'macro', 'attributesPanel'])
@connect(({ assets, editorPanel }, ownProps) => {
  if (isBGM(ownProps.block)) {
    return {
      assets: assets.BGMs,
      recentUsedAssets: editorPanel.RecentUsed[BGM][0],
      libraryIdSet: assets.BGMsLibraryIdSet,
    };
  }
  return {
    assets: assets.SEs,
    recentUsedAssets: editorPanel.RecentUsed[SE][0],
    libraryIdSet: assets.SEsLibraryIdSet,
  };
})

export default class AudioAttributesForm extends React.Component {
  static propTypes = {
    assets: PropTypes.array.isRequired,
    recentUsedAssets: PropTypes.array.isRequired,
    attributesDefList: PropTypes.array.isRequired,
    libraryIdSet: PropTypes.instanceOf(Set).isRequired,
    block: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  handleAudioSelect = (asset, attributeName) => {
    const { dispatch, block } = this.props;

    const updatedBlock = saveAttributeValue(
      attributeName,
      block,
      asset.id.toString(),
      'reference',
    );
    updatedBlock.attributes.storage.asset = asset;
    this.props.dispatch(BlockAction.updateBlockView(updatedBlock));
    this.props.dispatch(RecentUsed.Actions.push({
      asset,
      assetType: isBGM(block) ? BGM : SE,
    }));
  }

  handleOnClickAudioSelection = (audios, selectedAudio, attributeName) => {
    const {
      dispatch, t, assets, block, libraryIdSet, recentUsedAssets,
    } = this.props;
    if (this.audioPlayer) {
      this.audioPlayer.pauseAudio();
    }

    const title = t(isBGM(block) ?
      'audioSelectionModal.title.chooseMusic' :
      'audioSelectionModal.title.chooseSound'
    );

    dispatch(openAudioSelectionModal({
      audios,
      recentUsedAssets,
      selectedAudio,
      title,
      assetLibraryIds: [...libraryIdSet],
      className: SELECTION_MODAL_CONSTANT.AUDIO,
      width: 600,
      onSelected: value => this.handleAudioSelect(value, attributeName),
    }));
  }

  renderAudioInput(index, attributeDef) {
    const { assets, block, t } = this.props;
    const assetType = getAssetType(block);
    const attributeName = attributeDef.name; // "storage"

    let attributeLabel = t(`${assetType}.${attributeName}`);
    if (attributeDef.required) {
      attributeLabel = `${attributeLabel} (${t('requiredAsset')})`;
    }

    const attribute = block.attributes[attributeName] || {};

    const selectedAudioAssetId = attribute.asset ? attribute.asset.id : 0;
    const selectedAudioAssetName = attribute.asset ? attribute.asset.nameEn : '';
    const selectedAudioAssetUrl = attribute.asset ? getAudioMp4Url(attribute.asset) : '';

    const dropdownPlaceholder = isBGM(block) ?
      t('audioSelectionModal.placeholder.music') :
      t('audioSelectionModal.placeholder.sound');

    const audioComponent = (
      <div
        key={index}
        className="attribute-panel-row"
      >
        {selectedAudioAssetUrl &&
          <AudioPlayer
            ref={e => this.audioPlayer = e}
            mode="hiddenVolume"
            title={selectedAudioAssetName}
            url={selectedAudioAssetUrl}
            selected
          />
        }
        <Dropdown
          staticLabel={selectedAudioAssetName || dropdownPlaceholder}
          fullWidth
          onClick={() => this.handleOnClickAudioSelection(
            assets,
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
        if (attributeDef.name === 'storage') {
          attributeInputs.push(this.renderAudioInput(index, attributeDef));
        } else {
          attributeInputs.push(
            <AttributeRow
              key={index}
              attributeDef={attributeDef}
              block={block}
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
