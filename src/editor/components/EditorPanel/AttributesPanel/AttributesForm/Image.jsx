import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import uuid from 'uuid';

import { DOMAIN_URL } from 'common/constants';
import * as BlockAction from 'editor/actions/block';

import Checkbox from 'ui-elements/Checkbox';
import ColorPicker from 'ui-elements/ColorPicker';
import Dropdown from 'ui-elements/Dropdown';
import ResizedImage from 'ui-elements/ResizedImage';
import SliderBar from 'ui-elements/SliderBar';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';
import RecentUsed from 'editor/components/EditorPanel/RecentUsed';

import AttributeRow from '../AttributeRow';
import AssetSelectionModal from '../AssetSelectionModal';

import {
  convertAttributeDefinitions,
  saveAttributeValue,
} from '../utils';

const defaultStyle = {
  color: null,
  opacity: null,
  inverted: null,
  grayscale: null,
};

function getStateFromProps(props) {
  const { attributes } = props.block;
  return {
    definitions: convertAttributeDefinitions(props.attributesDefinitions),
    selectedAssetId: _get(attributes, 'storage.asset.id'),
  };
}

@translate(['attributesPanel', 'editor'])
@connect((store, ownProps) => {
  const {
    assets,
    editorPanel,
  } = store;
  const macroName = _get(ownProps, 'block.macroName');
  let assetDict = {};
  let assetList = [];
  let assetType;
  let recentUsedAssets = [];
  let libraryIdSet = [];
  switch (macroName) {
    case 'bg':
      assetDict = assets.bgImageDict;
      assetList = assets.bgImageList;
      assetType = RecentUsed.Constants.BG;
      recentUsedAssets = editorPanel.RecentUsed[assetType];
      libraryIdSet = assets.bgImageLibraryIdSet;
      break;
    case 'item':
      assetDict = assets.itemImageDict;
      assetList = assets.itemImageList;
      assetType = RecentUsed.Constants.ITEM;
      recentUsedAssets = editorPanel.RecentUsed[assetType];
      libraryIdSet = assets.itemImageLibraryIdSet;
      break;
    default:
      break;
  }
  return {
    assetDict,
    assetList,
    assetType,
    libraryIdSet,
    recentUsedAssets,
  };
})
export default class ImageForm extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    assetDict: PropTypes.object,
    assetList: PropTypes.array,
    assetType: PropTypes.string,
    block: PropTypes.object,
    libraryIdSet: PropTypes.object,
    recentUsedAssets: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...getStateFromProps(nextProps),
      ...(_get(nextProps, 'block.id') !== _get(this.props, 'block.id') ? defaultStyle : {}),
    });
  }

  handleOpenImageSelectionModalRequest = () => {
    const {
      assetList,
      block,
      dispatch,
      libraryIdSet,
      recentUsedAssets,
      t,
    } = this.props;
    const { selectedAssetId } = this.state;

    const title = (
      block.macroName === 'item' ?
      t('itemImageSelectionModal.title') :
      t('backgroundImageSelectionModal.title')
    );

    dispatch(AssetSelectionModal.Actions.open({
      assets: assetList,
      assetLibraryIds: [...libraryIdSet],
      selectedAssetId,
      title,
      recentUsedAssets,
      onSelected: this.handleAssetSelect,
    }));
    dispatch(InteractiveTutorial.Action.achieve(['0aa42c1']));
  }

  handleAssetSelect = (selectedAssetId) => {
    const {
      assetDict,
      assetType,
      block,
      dispatch,
    } = this.props;
    const asset = assetDict[selectedAssetId];
    const updatedBlock = saveAttributeValue(
      'storage',
      block,
      asset.id,
      'reference',
      asset
    );
    dispatch(BlockAction.updateBlockView(updatedBlock));
    dispatch(RecentUsed.Actions.push({
      asset,
      assetType,
    }));
    if (block.macroName === 'bg') {
      dispatch(InteractiveTutorial.Action.achieve(['7d618aa']));
    }
    this.setState({ selectedAssetId });
  }

  handleMaskColorChange = (color) => {
    this.setState({ color });
  }

  handleMaskOpacityChange = (opacity) => {
    this.setState({ opacity: parseInt(opacity, 10) });
  }

  handleImageInvertChange = (inverted) => {
    this.setState({ inverted });
  }

  handleImageGrayscaleChange = (isGray) => {
    this.setState({ isGray });
  }

  renderImage() {
    const {
      assetDict,
      block,
      t,
    } = this.props;
    const {
      selectedAssetId,
      color,
      opacity,
      inverted,
      isGray,
    } = this.state;

    let imageURL = '';
    let name = '';

    if (selectedAssetId) {
      const asset = assetDict[selectedAssetId];
      if (asset) {
        imageURL = `${DOMAIN_URL}${asset.url}`;
        name = asset.nameEn;
      }
    }

    const { mopacity, mcolor, convert, grayscale } = block.attributes;

    const maskOpacity = this.state.opacity || parseInt(_get(mopacity, 'value', 0), 10);
    const maskImageStyle = {
      backgroundColor: this.state.color || _get(mcolor, 'value'),
      opacity: maskOpacity / 255,
    };

    const imageStyle = {
      filter: `
        invert(${inverted || _get(convert, 'value') ? 1 : 0})
        grayscale(${isGray || _get(grayscale, 'value') ? 1 : 0})
      `,
    };

    return (
      <div className="attribute-panel-row">
        {!!imageURL && <ResizedImage
          src={imageURL}
          width={320}
          centerImage={block.macroName === 'item'}
          imageStyle={imageStyle}
          maskImageStyle={maskImageStyle}
        />}
        <Dropdown
          placeholder={t(`placeholder.dropDown.${block.macroName}`)}
          staticLabel={name}
          fullWidth
          onClick={this.handleOpenImageSelectionModalRequest}
        />
      </div>
    );
  }

  render() {
    const {
      props,
    } = this;
    const {
      block,
      recentUsedAssets,
      t,
    } = props;
    const { definitions } = this.state;
    const isSelected = false;
    return (
      <div className="attribute-form-image">
        {this.renderImage()}
        <hr />
        <AttributeRow.Group className="bg-filter">
          {definitions.mcolor &&
            <AttributeRow
              attributeDef={definitions.mcolor}
              block={block}
              id="bg-filter-color"
              onChange={this.handleMaskColorChange}
            />
          }
          {definitions.mopacity &&
            <AttributeRow
              attributeDef={definitions.mopacity}
              block={block}
              id="bg-filter-opacity"
              onChange={this.handleMaskOpacityChange}
            />
          }
        </AttributeRow.Group>
        <hr />
        <AttributeRow.Group>
          {definitions.convert &&
            <AttributeRow
              attributeDef={definitions.convert}
              block={block}
              fullWidth={false}
              onChange={this.handleImageInvertChange}
            />
          }
          {definitions.grayscale &&
            <AttributeRow
              attributeDef={definitions.grayscale}
              block={block}
              fullWidth={false}
              onChange={this.handleImageGrayscaleChange}
            />
          }
        </AttributeRow.Group>
        <hr />
        {definitions.time &&
          <AttributeRow
            attributeDef={definitions.time}
            block={block}
          />
        }
        <hr />
        <AttributeRow.Group>
          {definitions.clfg &&
            <AttributeRow
              attributeDef={definitions.clfg}
              block={block}
              fullWidth={false}
            />
          }
          {definitions.hidemes &&
            <AttributeRow
              attributeDef={definitions.hidemes}
              block={block}
              fullWidth={false}
            />
          }
        </AttributeRow.Group>
        {definitions.waitingtime && <hr />}
        {definitions.waitingtime &&
          <AttributeRow
            attributeDef={definitions.waitingtime}
            block={block}
          />
        }
      </div>
    );
  }
}
