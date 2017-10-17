import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import Progress from 'ui-elements/Progress';

import AssetGridItem from './AssetGridItem';

import './AssetGridList.style.scss';


function AssetGridList(props) {
  const { assets, loaded, loading, readonly, type } = props;

  const className = classNames('asset-grid-list', type);

  function handleClickAddButton() {
    props.onClickAddButton(type);
  }

  function renderChildren() {
    if (loading) {
      return (
        <div className="asset-grid-list-loading">
          <Progress.LoadingIndicator />
        </div>
      );
    }

    if (readonly && loaded && assets.length === 0) {
      return (
        <div className="asset-grid-list-empty">
          {props.placeholder}
        </div>
      );
    }

    return (
      <ol>
        {props.onClickAddButton &&
          <AssetGridItem.AddButton
            type={type}
            onClick={handleClickAddButton}
          />
        }
        {assets.map(asset => (
          <AssetGridItem
            key={asset.id}
            asset={asset}
            readonly={readonly}
            type={type}
            onClick={props.onClickItem}
          />
        ))}
      </ol>
    );
  }

  return (
    <div className={className}>
      {renderChildren()}
    </div>
  );
}

AssetGridList.propTypes = {
  type: PropTypes.string.isRequired,
  assets: PropTypes.array,
  loaded: PropTypes.bool,
  loading: PropTypes.bool,
  placeholder: PropTypes.node,
  readonly: PropTypes.bool,
  onClickAddButton: PropTypes.func,
  onClickItem: PropTypes.func,
};

AssetGridList.defaultProps = {
  assets: [],
  loaded: false,
  loading: false,
  readonly: false,
};

export default AssetGridList;
