import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import GridList from 'ui-elements/GridList';
import Card from 'ui-elements/Card';

import { toggleBackgroundModal } from './BackgroundModal/redux';
import { openCharacterModal } from './CharacterModal/actions';
import { toggleItemModal } from './ItemModal/redux';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { DOMAIN_URL } from 'common/constants';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import {
  isCharacterType,
  fetchAssetsIfNeeded,
  ownEditPermission,
} from './utils';


const getAssetThumbnailURL = (asset, type) => {
  if (isCharacterType(type)) {
    const fgImage = asset.fgimages[0];
    if (fgImage) {
      return `${DOMAIN_URL}${fgImage.url}`;
    }
    return '';
  }
  return asset.url;
};

@translate()
@connect(({ libraryPanel }, ownProps) => {
  let assets = [];
  let sync = true;
  switch (ownProps.type) {
    case ASSET_TYPE.CHARACTER:
      assets = libraryPanel.charactersList.characters;
      sync = libraryPanel.charactersList.sync;
      break;
    case ASSET_TYPE.ITEM:
      assets = libraryPanel.itemsList.items;
      sync = libraryPanel.itemsList.sync;
      break;
    case ASSET_TYPE.BACKGROUND:
      assets = libraryPanel.backgroundsList.backgrounds;
      sync = libraryPanel.backgroundsList.sync;
      break;
    default:
      break;
  }
  const haveEditPermission = ownEditPermission(libraryPanel.selectedLibrary);
  return {
    haveEditPermission,
    assets,
    sync,
  };
})
export default class AssetsGridList extends React.Component {

  static propTypes = {
    assets: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    libraryId: PropTypes.number.isRequired,
    sync: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    haveEditPermission: PropTypes.bool,
  }

  componentDidMount() {
    fetchAssetsIfNeeded(this.props);
  }

  componentWillReceiveProps(nextProps) {
    fetchAssetsIfNeeded(nextProps);
  }

  handleAddAssetClick = () => {
    this.props.dispatch(InteractiveTutorial.Action.achieve(['fb4a175']));
    this.toggleAssetModal();
  }

  handleAssetSelect = (asset) => {
    // const { haveEditPermission } = this.props;
    // if (!haveEditPermission) return;
    this.toggleAssetModal(asset);
  }

  toggleAssetModal(asset) {
    const { dispatch, type } = this.props;
    const payload = {
      open: true,
      asset,
    };
    switch (type) {
      case ASSET_TYPE.CHARACTER:
        dispatch(openCharacterModal(payload.asset));
        break;
      case ASSET_TYPE.BACKGROUND:
        dispatch(toggleBackgroundModal(payload));
        break;
      case ASSET_TYPE.ITEM:
        dispatch(toggleItemModal(payload));
        break;
      default:
        break;
    }
  }

  render() {
    const {
      assets,
      t,
      type,
      haveEditPermission,
    } = this.props;

    const GridListId = `library-panel-${type}-list`;

    return (
      <GridList elementHeight={210} elementWidth={170} id={GridListId}>
        {haveEditPermission && <Card add onClick={this.handleAddAssetClick} />}
        {assets.map((asset, index) => (
          <Card
            key={asset.id}
            onClick={() => this.handleAssetSelect(asset)}
          >
            <Card.Image src={getAssetThumbnailURL(asset, type)} />
            <Card.Content>
              <Card.Header>
                {asset.nameEn}
              </Card.Header>
            </Card.Content>
          </Card>
        ))}
      </GridList>
    );
  }
}
