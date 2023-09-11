import React, { Component } from 'react';

import AddIcon from 'common/icons/add';

export default class LibraryThumbnail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: props.isSelected,
    };
  }

  onClickUseAsset = () => {
    const { onClickUseAsset } = this.props;
    if (onClickUseAsset) onClickUseAsset(this.props.info);
    this.setState({ isSelected: !this.state.isSelected });
  }

  onClickAddAsset = () => {
    const { onClickAddAsset } = this.props;
    if (onClickAddAsset) onClickAddAsset();
  }

  onClickCategory = () => {

  }

  renderLibraryThumbnail() {
    const { isSelected } = this.state;
    const { info, selectable } = this.props;
    const { image, title, creator } = info;
    return (
      <div
        className="library-thumbnail"
        onClick={this.onClickCategory}
      >
        { selectable &&
          <div
            className="triangle-border"
            style={{ borderTopColor: isSelected ? '#FF3A4E' : '#D8D8D8' }}
            onClick={this.onClickUseAsset}
          />
        }

        <div
          className="cover-photo"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="cover-description">
          <h4>{title}</h4>
          <p>創建者：{creator}</p>

        </div>
      </div>
    );
  }

  renderAddLibraryThumbnail() {
    return (
      <div
        className="library-thumbnail add-library-thumbnail"
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

    return isEmptyAsset ? this.renderAddLibraryThumbnail() : this.renderLibraryThumbnail();
  }
}
