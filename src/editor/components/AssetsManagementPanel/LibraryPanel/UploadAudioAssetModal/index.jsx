import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import classNames from 'classnames';
import update from 'immutability-helper';
import _get from 'lodash/get';

import AudioUpload from 'ui-elements/AudioUpload';
import Modal from 'ui-elements/Modal';
import Progress from 'ui-elements/Progress';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';
import UsersDropdown from 'ui-elements/UsersDropdown';


import CloseIcon from 'common/icons/close';

import * as ASSET_TYPE from 'common/constants/assetTypes';

import {
  toggleUploadAudioAssetModal,
  addAudioFiles,
  removeAudioFile,
} from './actions';

import {
  addAssets,
} from '../actions';

import { getFilename } from '../utils';

import './styles.scss';


@translate(['assetsManagement', 'general'])
@connect(({ libraryPanel, user }) => {
  const {
    selectedLibrary,
    uploadAudioAssetModal,
  } = libraryPanel;
  return {
    ...uploadAudioAssetModal,
    libraryId: selectedLibrary ? selectedLibrary.id : null,
    user,
  };
})
export default class UploadAudioAssetModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    uploadProgress: PropTypes.object.isRequired,
    uploading: PropTypes.bool.isRequired,
    audioFiles: PropTypes.array,
    libraryId: PropTypes.number,
    type: PropTypes.string,
    user: PropTypes.object,
  }

  static defaultProps = {
    open: false,
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

  handleCloseButtonClick = () => {
    this.props.dispatch(toggleUploadAudioAssetModal({ open: false }));
  }

  getSerializedAudioFiles = (audioFiles) => {
    const serializedAudioFiles = [];
    if (audioFiles) {
      const {
        libraryId,
        user,
      } = this.props;
      audioFiles.forEach((audio, index) => {
        const serializedAudioFile = _get(
          this,
          `state.serializedAudioFiles[${index}]`
        );
        const name = _get(
          serializedAudioFile,
          'meta.nameEn',
          getFilename(audio.name)
        );
        const users = _get(
          serializedAudioFile,
          'meta.users',
          [user]
        );
        const newSerializedAudioFile = {
          file: audio,
          meta: {
            libraryId,
            nameEn: name,
            users,
          },
        };
        serializedAudioFiles.push(newSerializedAudioFile);
      });
    }
    return serializedAudioFiles;
  }

  handleAudioUploadOnchange = (files) => {
    this.props.dispatch(addAudioFiles(files));
  }

  handleDeleteItem = (index) => {
    this.props.dispatch(removeAudioFile(index));
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

  handleConfirmButtonClick = () => {
    this.props.dispatch(
      addAssets(this.state.serializedAudioFiles, this.props.type)
    );
  }

  renderAudioFilesList(audioFiles = []) {
    // TODO: refactor this render to another component
    const {
      t,
      uploading,
      uploadProgress,
    } = this.props;

    return audioFiles.map((sound, index) => {
      const progress = uploadProgress[index];
      return (
        <div className="upload-audio-item" key={index} >
          <div className="audio-item-header">
            <p>{`${index + 1}. ${sound.file.name}`}</p>
            {!uploading &&
              <div
                className="close-icon"
                onClick={() => this.handleDeleteItem(index)}
              >
                <CloseIcon />
              </div>
            }
          </div>
          <TextField
            disabled={uploading}
            placeholder={t('uploadMusicModal.placeholder.name')}
            value={sound.meta.nameEn}
            fullWidth
            onChange={(value) => this.handleNameChange(value, index)}
          />
          <UsersDropdown
            users={sound.meta.users}
            fullWidth
            onChange={(users) => this.handleCreditsChange(users, index)}
          />
          {uploading &&
            <div className="upload-progress">
              <Progress value={(progress > 0 && progress < 100) ? progress : null} />
            </div>
          }
        </div>
      );
    });
  }

  render() {
    const {
      t,
      open,
      type,
      uploading,
    } = this.props;

    const { serializedAudioFiles } = this.state;
    const deleteButton = null;

    const valid = (
      serializedAudioFiles.length > 0) &&
      serializedAudioFiles.every(({ meta }) => (
        meta.nameEn &&
        meta.nameEn.trim().length > 0 &&
        meta.users &&
        meta.users.length > 0
      )
    );

    const confirmButton = (
      <RaisedButton
        disabled={!valid || uploading}
        label={t('uploadMusicModal.button.upload')}
        primary
        onClick={this.handleConfirmButtonClick}
      />
    );

    const className = classNames(
      'upload-audio-modal',
    );

    return (
      <Modal className={className} open={open}>
        <Modal.Header onClickCloseButton={this.handleCloseButtonClick}>
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
          {this.renderAudioFilesList(serializedAudioFiles)}
        </Modal.Body>
        <Modal.Footer
          leftItems={[deleteButton]}
          rightItems={[confirmButton]}
        />
      </Modal>
    );
  }
}
