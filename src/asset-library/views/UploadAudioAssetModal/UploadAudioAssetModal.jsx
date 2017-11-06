import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import classNames from 'classnames';
import update from 'immutability-helper';
import _get from 'lodash/get';

import AudioUpload from 'ui-elements/AudioUpload';
import FlatButton from 'ui-elements/FlatButton';
import Modal from 'ui-elements/Modal';
import Progress from 'ui-elements/Progress';
import TextField from 'ui-elements/TextField';
import UsersDropdown from 'ui-elements/UsersDropdown';

import CloseIcon from 'common/icons/close';
import TickIcon from 'common/icons/publish';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { MAX_AUDIO_FILE_SIZE } from 'asset-library/constants';

import { getFilename } from 'common/utils';
import {
  getFileSizeString,
  isFileSizeExceedLimit,
} from 'asset-library/utils/asset';

import { actions as LibraryDetailsActions } from 'asset-library/views/LibraryDetails';
import * as Actions from './UploadAudioAssetModal.actions';

import './UploadAudioAssetModal.style.scss';


@translate(['assetsManagement', 'general', 'error'])
@connect(store => ({
  ...store.UploadAudioAssetModal,
  user: store.user,
}))
export default class UploadAudioAssetModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    uploadProgress: PropTypes.object.isRequired,
    uploadStatus: PropTypes.array.isRequired,
    uploading: PropTypes.bool.isRequired,
    audioFiles: PropTypes.array,
    error: PropTypes.string,
    libraryId: PropTypes.number,
    type: PropTypes.string,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props);
    const { audioFiles } = props;
    const serializedAudioFiles = this.getSerializedAudioFiles(audioFiles);
    this.state = { serializedAudioFiles };
  }

  componentWillReceiveProps({ audioFiles, open }) {
    if (!open) {
      // reset state to avoid use old name after uploaded audio
      this.setState({ serializedAudioFiles: [] });
    } else {
      const serializedAudioFiles = this.getSerializedAudioFiles(audioFiles);
      this.setState({ serializedAudioFiles });
    }
  }

  getSerializedAudioFiles = (audioFiles) => {
    const serializedAudioFiles = [];
    if (audioFiles) {
      const { libraryId, user } = this.props;
      return audioFiles.map((audio, index) => {
        const serializedAudioFile = _get(this, `state.serializedAudioFiles[${index}]`);
        const name = _get(serializedAudioFile, 'meta.nameEn', getFilename(audio.name));
        const users = _get(serializedAudioFile, 'meta.users', [user]);
        const creditsUrl = _get(serializedAudioFile, 'meta.creditsUrl', '');
        return {
          file: audio,
          meta: {
            libraryId,
            nameEn: name,
            users,
            creditsUrl,
          },
        };
      });
    }
    return serializedAudioFiles;
  }

  handleCloseButtonClick = () => {
    if (this.props.uploading) return;
    this.props.dispatch(Actions.toggle({ open: false }));
  }

  handleAudioUploadOnchange = (files) => {
    const { dispatch, uploadStatus } = this.props;
    if (uploadStatus.some(status => !!status.error)) {
      // empty the audio file list when re-upload since the list only contains files with transcode error
      this.setState({ serializedAudioFiles: [] }, () => dispatch(Actions.addAudioFiles(files)));
    } else {
      dispatch(Actions.addAudioFiles(files));
    }
  }

  handleDeleteItem = (index) => {
    this.setState(update(this.state, {
      serializedAudioFiles: {
        $splice: [[index, 1]],
      },
    }), () => this.props.dispatch(Actions.removeAudioFile(index)));
  }

  handleNameChange = (value, index) => {
    this.setState(update(this.state, {
      serializedAudioFiles: {
        [index]: {
          meta: {
            nameEn: { $set: value },
          },
        },
      },
    }));
  }

  handleCreditsChange = (users, index) => {
    this.setState(update(this.state, {
      serializedAudioFiles: {
        [index]: {
          meta: {
            users: { $set: users },
          },
        },
      },
    }));
  }

  handleCreditsUrlChange = (value, index) => {
    this.setState(update(this.state, {
      serializedAudioFiles: {
        [index]: {
          meta: {
            creditsUrl: { $set: value },
          },
        },
      },
    }));
  }

  handleConfirmButtonClick = () => {
    this.props.dispatch(
      LibraryDetailsActions.addAssets(this.state.serializedAudioFiles, this.props.type)
    );
  }

  renderAudioFilesList(audioFiles = []) {
    // TODO: refactor this render to another component
    const { t, uploading, uploadProgress, uploadStatus } = this.props;
    return audioFiles.map((audio, index) => {
      const progress = uploadProgress[index];
      const fileSize = audio.file.size;
      const isUploaded = index < uploadStatus.length;
      const hasError = isUploaded && !!uploadStatus[index].error;

      return (
        <div key={index} className="upload-audio-item">
          {uploading && !isUploaded &&
            <div className="upload-progress">
              <Progress value={(progress > 0 && progress < 100) ? progress : null} />
            </div>
          }
          <div className="audio-item-details">
            <div className="audio-item-header">
              <p>
                {`${index + 1}. ${audio.file.name} (${getFileSizeString(fileSize)})`}
                {isUploaded && !hasError && <TickIcon />}
              </p>
              {hasError &&
                <p className="audio-item-error">
                  {t(uploadStatus[index].error)}
                </p>
              }
              {isFileSizeExceedLimit(fileSize) &&
                <p className="audio-item-error">
                  {t('ERR_AUDIO_FILE_SIZE_TOO_LARGE', {
                    size: MAX_AUDIO_FILE_SIZE.MB,
                  })}
                </p>
              }
              {!uploading &&
                <FlatButton
                  className="close-icon"
                  icon={<CloseIcon />}
                  onClick={() => this.handleDeleteItem(index)}
                />
              }
            </div>
            <TextField
              disabled={uploading}
              placeholder={t('uploadMusicModal.placeholder.name')}
              value={audio.meta.nameEn}
              fullWidth
              onChange={value => this.handleNameChange(value, index)}
            />
            <UsersDropdown
              users={audio.meta.users}
              fullWidth
              onChange={users => this.handleCreditsChange(users, index)}
            />
            <TextField
              disabled={uploading}
              placeholder={t('uploadMusicModal.placeholder.creditsUrl')}
              value={audio.meta.creditsUrl}
              fullWidth
              onChange={value => this.handleCreditsUrlChange(value, index)}
            />
          </div>
        </div>
      );
    });
  }

  render() {
    const { t, open, type, uploading, error, uploadStatus } = this.props;
    const { serializedAudioFiles } = this.state;

    const valid = (
      serializedAudioFiles.length > 0) &&
      serializedAudioFiles.every(({ meta, file }) => (
        meta.nameEn &&
        meta.nameEn.trim().length > 0 &&
        meta.users &&
        (meta.users.length > 0 || meta.creditsUrl.length > 0) &&
        !isFileSizeExceedLimit(file.size)
      )
    );

    const hasTranscodeError = uploadStatus.some(status => !!status.error);
    const footerProps = {
      leftButtonDisabled: uploading,
      onClickLeftButton: this.handleCloseButtonClick,

      rightButtonDisable: !valid || uploading || hasTranscodeError,
      rightButtonTitle: t('uploadMusicModal.button.upload'),
      onClickRightButton: this.handleConfirmButtonClick,
    };

    const className = classNames('upload-audio-modal');

    return (
      <Modal
        className={className}
        open={open}
        onClickOutside={this.handleCloseButtonClick}
      >
        <Modal.Header
          closeButtonDisabled={uploading}
          onClickCloseButton={this.handleCloseButtonClick}
        >
          {t(`uploadMusicModal.${type === ASSET_TYPE.MUSIC ? 'addMusic' : 'addSound'}`)}
        </Modal.Header>
        <Modal.Body>
          <div className="continue-add-bar">
            <AudioUpload
              disabled={uploading}
              label={t('uploadMusicModal.button.addFile')}
              onChange={this.handleAudioUploadOnchange}
            />
          </div>
          {error && (
            <span className="audio-error">{t(error)}</span>
          )}
          {this.renderAudioFilesList(serializedAudioFiles)}
        </Modal.Body>
        <Modal.Footer {...{ ...footerProps }} />
      </Modal>
    );
  }
}
