import React, { Component } from 'react';
import AddIcon from 'common/icons/add';

export default class LibraryAssetThumbnail extends React.Component {

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     isSelected: props.isSelected,
  //   };
  // }

  onClickAssetThumbnail = () => {
    const { onClickedAssetThumbnail } = this.props;
    if (onClickedAssetThumbnail) onClickedAssetThumbnail();
    console.log('Clicked Asset Thumbnail');
  }
  onClickAddAsset = () => {
    const { onClickAddAsset } = this.props;
    if (onClickAddAsset) onClickAddAsset();
    console.log('Clicked Add Asset Thumbnail');
  }

  renderLibraryAssetThumbnail() {
    const { info } = this.props;
    const { image, title } = info;
    return (
      <div
        className="library-asset"
        onClick={this.onClickAssetThumbnail}
      >
        <div
          className="cover-photo"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="cover-description">
          <h4>{title}</h4>
        </div>
      </div>
    );
  }

  renderAddLibraryAssetThumbnail() {
    return (
      <div
        className="add-library-thumbnail"
        onClick={this.onClickAddAsset}
      >
        <AddIcon />
      </div>
    );
  }

  render() {
    const { info } = this.props;
    let isEmptyAsset = true;
    if (info) {
      isEmptyAsset = false;
    }

    return (
      <div className="library-thumbnail">
        {isEmptyAsset ? this.renderAddLibraryAssetThumbnail() : this.renderLibraryAssetThumbnail() }
      </div>
    );
  }
}
