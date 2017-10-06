import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import GridList from 'ui-elements/GridList';
import AudioPlayerList from 'ui-elements/AudioPlayerList';
import AudioPlayer from 'ui-elements/AudioPlayer';
import FlatButton from 'ui-elements/FlatButton';
import AudioUpload from 'ui-elements/AudioUpload';
import AddIcon from 'common/icons/add';
import UploadAudioAssetModal from './UploadAudioAssetModal';
import EditAudioAssetModal from './EditAudioAssetModal';

import {
  toggleUploadAudioAssetModal,
} from './UploadAudioAssetModal/actions';
import {
  toggleEditAudioAssetModal,
} from './EditAudioAssetModal/redux';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { getAudioMp4Url } from 'editor/utils/app';

import {
  fetchAssetsIfNeeded,
  ownEditPermission,
} from './utils';


@translate(['AudioList'])
@connect(({ libraryPanel }, ownProps) => {
  let loading = false;
  let sounds = [];
  let sync = true;
  switch (ownProps.type) {
    case ASSET_TYPE.MUSIC:
      loading = libraryPanel.BGMsList.loading;
      sounds = libraryPanel.BGMsList.BGMs;
      sync = libraryPanel.BGMsList.sync;
      break;
    case ASSET_TYPE.SOUND:
      loading = libraryPanel.SEsList.loading;
      sounds = libraryPanel.SEsList.SEs;
      sync = libraryPanel.SEsList.sync;
      break;
    default:
      break;
  }
  const readonly = !ownEditPermission(libraryPanel.selectedLibrary);
  return {
    readonly,
    loading,
    sounds,
    sync,
  };
})
export default class AudioList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    libraryId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    sounds: PropTypes.array.isRequired,
    sync: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    readonly: PropTypes.bool, // should not be null
  }

  componentDidMount() {
    fetchAssetsIfNeeded(this.props);
  }

  componentWillReceiveProps(nextProps) {
    fetchAssetsIfNeeded(nextProps);
  }

  handleAudioInputChange = (files) => {
    const { type } = this.props;
    this.props.dispatch(toggleUploadAudioAssetModal({ open: true, type, audioFiles: files }));
  }

  handleRightButtonClick = (index, readonly = false) => {
    const { sounds, type } = this.props;
    const asset = sounds[index];
    this.props.dispatch(toggleEditAudioAssetModal({
      asset,
      open: true,
      readonly,
      type,
    }));
  }

  handleInfoButtonClick = (index) => {
    this.handleRightButtonClick(index, true);
  }

  render() {
    const {
      readonly,
      loading,
      sounds,
      t,
      type,
    } = this.props;

    return (
      <div>
        {!readonly &&
          <AudioUpload
            label={t(`button.add.${type}`)}
            onChange={this.handleAudioInputChange}
          />
        }
        <AudioPlayerList loading={loading}>
          {sounds.map((sound, index) => (
            sound.url &&
              <AudioPlayer
                key={index}
                mode={readonly ? 'info' : 'edit'}
                title={`${sound.nameEn}`}
                url={getAudioMp4Url(sound)}
                onClickEditButton={this.handleRightButtonClick}
                onClickInfoButton={this.handleInfoButtonClick}
              />
          ))}
        </AudioPlayerList>
        <UploadAudioAssetModal />
        <EditAudioAssetModal />
      </div>
    );
  }
}
