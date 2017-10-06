import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import _get from 'lodash/get';

import AudioPlayer from 'ui-elements/AudioPlayer';
import GreyButton from 'ui-elements/GreyButton';

import AddIcon from 'common/icons/add-thin';

import * as ASSET_TYPES from 'common/constants/assetTypes';
import { getThumbnail } from 'common/utils';
import { getAudioMp4Url } from 'editor/utils/app';


function AssetGridItemAddButton(props) {
  const { onClick, type } = props;
  const className = classNames('asset-grid-item', type, 'add-button');

  function handleClick() {
    onClick(type);
  }

  return (
    <li className={className}>
      <GreyButton icon={<AddIcon />} onClick={onClick && handleClick} />
    </li>
  );
}

AssetGridItemAddButton.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

function AssetGridItem(props) {
  const { asset, readonly, type, onClick } = props;

  const isAudioAsset = (
    type === ASSET_TYPES.MUSIC ||
    type === ASSET_TYPES.SOUND
  );

  const previewUrl = getThumbnail(
    (type === ASSET_TYPES.CHARACTER ? _get(asset, 'fgimages[0].url') : asset.url) || ''
  );

  function handleClick(event) {
    if (onClick) onClick(asset, type, event);
  }

  const className = classNames('asset-grid-item', type);

  const assetName = asset.nameEn || asset.name; // only character is localized at the moment

  return (
    <li className={className}>
      {isAudioAsset ? (
        <AudioPlayer
          key={asset.id}
          mode={readonly ? 'info' : 'edit'}
          title={assetName}
          url={getAudioMp4Url(asset)}
          onClickEditButton={handleClick}
          onClickInfoButton={handleClick}
        />
      ) : (
        <div onClick={handleClick}>
          <div
            className="asset-preview"
            style={{ backgroundImage: `url("${previewUrl}")` }}
          />
          <div className="asset-info">
            <span className="title">{assetName}</span>
          </div>
        </div>
      )}
    </li>
  );
}

AssetGridItem.propTypes = {
  asset: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  readonly: PropTypes.bool,
  onClick: PropTypes.func,
};

AssetGridItem.defaultProps = {
  readonly: false,
};

AssetGridItem.AddButton = AssetGridItemAddButton;

export default AssetGridItem;
