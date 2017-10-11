import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import _get from 'lodash/get';

import GridList from 'ui-elements/GridList';

import CheckIcon from 'common/icons/publish';

import { DOMAIN_URL } from 'common/constants';
import { getThumbnail } from 'common/utils';


export default class AssetList extends React.Component {
  static propTypes = {
    assets: PropTypes.array,
    selectedAssetId: PropTypes.number,
    onSelect: PropTypes.func,
  }

  static defaultProps = {
    assets: [],
  }

  handleListItemClick = (itemId) => {
    if (this.props.onSelect) this.props.onSelect(itemId);
  }

  render() {
    const {
      selectedAssetId,
      assets,
    } = this.props;

    return (
      <div className="asset-list">
        {assets.map((asset) => {
          const selected = (selectedAssetId === asset.id);
          const assetType = _get(asset, 'types[0].name', 'reference');
          const className = classNames('asset-item', assetType, { selected });
          const assetTitle = asset.nameEn || asset.name; // only character is localized at the moment
          const assetThumbnail = getThumbnail(
            `${DOMAIN_URL}${asset.url || _get(asset, 'fgimages[0].url')}`
          );
          return (
            <div
              className={className}
              key={asset.id}
              onClick={() => this.handleListItemClick(asset.id)}
            >
              <div className="asset-item-wrapper">
                <div
                  className="asset-preview"
                  style={{ backgroundImage: `url("${assetThumbnail}")` }}
                />
                <div className="asset-meta">
                  <div className="asset-title">
                    {assetTitle}
                  </div>
                </div>
                {selected &&
                  <div className="asset-selected-overlay">
                    <CheckIcon />
                  </div>
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
