import React, { Component } from 'react';
import LibraryAssetThumbnail from './LibraryAssetThumbnail';

export default class LibraryAssetThumbnails extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state({
  //     selectedAssets: [],
  //   });
  // }

  render() {
    const { assets } = this.props;

    return (
      <div>
        <LibraryAssetThumbnail />
        {
          assets.map((info, index) => (
            <LibraryAssetThumbnail info={info} />
          ))
        }
      </div>
    );
  }
}
