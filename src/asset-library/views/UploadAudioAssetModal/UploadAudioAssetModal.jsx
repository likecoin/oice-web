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

import { actions as LibraryDetailsActions } from 'asset-library/views/LibraryDetails';
import * as Actions from './UploadAudioAssetModal.actions';

import { getFilename } from 'common/utils';

import './UploadAudioAssetModal.style.scss';


@translate(['assetsManagement', 'general'])
@connect((store) => ({
  ...store.UploadAudioAssetModal,
  user: store.user,
}))
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
    this.props.dispatch(Actions.toggle({ open: false }));
  }

  getSerializedAudioFiles = (audioFiles) => {
    const serializedAudioFiles = [];
    if (audioFiles) {
      const { libraryId, user } = this.props;
      audioFiles.forEach((audio, index) => {
        const serializedAudioFile = _get(this, `state.serializedAudioFiles[${index}]`);
        const name = _get(serializedAudioFile, 'meta.nameEn', getFilename(audio.name));
        const users = _get(serializedAudioFile, 'meta.users', [user]);
        const creditsUrl = _get(serializedAudioFile, 'meta.creditsUrl', '');
        const newSerializedAudioFile = {
          file: audio,
          meta: {
            libraryId,
            nameEn: name,
            users,
            creditsUrl,
          },
        };
        serializedAudioFiles.push(newSerializedAudioFile);
      });
    }
    return serializedAudioFiles;
  }

  handleAudioUploadOnchange = (files) => {
    this.props.dispatch(Actions.addAudioFiles(files));
  }

  handleDeleteItem = (index) => {
    this.props.dispatch(Actions.removeAudioFile(index));
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
    const { t, uploading, uploadProgress } = this.props;

    return audioFiles.map((sound, index) => {
      const progress = uploadProgress[index];
      return (
        <div key={index} className="upload-audio-item">
          <div className="audio-item-header">
            {/* <p>{`${index + 1}. ${sound.file.name}`}</p> */}
            <p>{sound.file.name}</p>
            {/* {!uploading &&
              <div className="close-icon" onClick={() => this.handleDeleteItem(index)}>
                <CloseIcon />
              </div>
            } */}
          </div>
          <TextField
            disabled={uploading}
            placeholder={t('uploadMusicModal.placeholder.name')}
            value={sound.meta.nameEn}
            fullWidth
            onChange={value => this.handleNameChange(value, index)}
          />
          <UsersDropdown
            users={sound.meta.users}
            fullWidth
            onChange={users => this.handleCreditsChange(users, index)}
          />
          <TextField
            disabled={uploading}
            placeholder={t('uploadMusicModal.placeholder.creditsUrl')}
            value={sound.meta.creditsUrl}
            fullWidth
            onChange={value => this.handleCreditsUrlChange(value, index)}
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
    const { t, open, type, uploading } = this.props;
    const { serializedAudioFiles } = this.state;

    const valid = (
      serializedAudioFiles.length > 0) &&
      serializedAudioFiles.every(({ meta }) => (
        meta.nameEn &&
        meta.nameEn.trim().length > 0 &&
        meta.users &&
        (meta.users.length > 0 || meta.creditsUrl.length > 0)
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

    const className = classNames('upload-audio-modal');

    return (
      <Modal
        className={className}
        open={open}
        onClickOutside={this.handleCloseButtonClick}
      >
        <Modal.Header onClickCloseButton={this.handleCloseButtonClick}>
          {t(`uploadMusicModal.${type === ASSET_TYPE.MUSIC ? 'addMusic' : 'addSound'}`)}
        </Modal.Header>
        <Modal.Body>
          {/* <div className="continue-add-bar">
            <AudioUpload
              disabled={uploading}
              label={t('uploadMusicModal.button.addFile')}
              onChange={this.handleAudioUploadOnchange}
            />
          </div> */}
          {this.renderAudioFilesList(serializedAudioFiles)}
        </Modal.Body>
        <Modal.Footer rightItems={[confirmButton]} />
      </Modal>
    );
  }
}
