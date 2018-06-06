import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import classNames from 'classnames';
import update from 'immutability-helper';

import AlertDialog from 'ui-elements/AlertDialog';
import AudioPlayer from 'ui-elements/AudioPlayer';
import FlatButton from 'ui-elements/FlatButton';
import Form from 'ui-elements/Form';
import Modal from 'ui-elements/Modal';
import Progress from 'ui-elements/Progress';
import TextField from 'ui-elements/TextField';
import UsersDropdown from 'ui-elements/UsersDropdown';

import CloseIcon from 'common/icons/close';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { MAX_AUDIO_FILE_SIZE } from 'asset-library/constants';

import { getAudioMp4Url } from 'editor/utils/app';
import { isFileSizeExceedLimit } from 'asset-library/utils/asset';

import { actions as LibraryDetailsActions } from 'asset-library/views/LibraryDetails';

import * as Actions from './EditAudioAssetModal.actions';

import './EditAudioAssetModal.style.scss';


const getStateFromProps = ({ asset }) => {
  const src = getAudioMp4Url(asset);
  return {
    asset: asset || {},
    file: null,
    src,
  };
};

// FILE READER HANDLER
function fileReaderErrorHandler(e) {
  switch (e.target.error.code) {
    case e.target.error.NOT_FOUND_ERR:
      console.log('File Not Found');
      break;
    case e.target.error.NOT_READABLE_ERR:
      console.log('File is not readable');
      break;
    case e.target.error.ABORT_ERR:
      break; // noop
    default:
      console.log('An error occurred reading this file.');
  }
}

function fileReaderUpdateProgress(e) {
  // e is an ProgressEvent.
  if (e.lengthComputable) {
    const percentLoaded = Math.round((e.loaded / e.total) * 100);
    // Increase the progress bar length.
    if (percentLoaded < 100) {
      // MEMO: handle ui progress here
    }
  }
}

function fileReaderStartLoad(e, here) {
  console.log('start from here %o', e);
}


@translate(['assetsManagement', 'general', 'EditAudioAssetModal', 'error'])
@connect(store => ({ ...store.EditAudioAssetModal }))
export default class EditAudioAssetModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    uploading: PropTypes.bool.isRequired,
    asset: PropTypes.object,
    error: PropTypes.string,
    readonly: PropTypes.bool,
    type: PropTypes.string,
  }

  static defaultProps = {
    readonly: true,
  }

  constructor(props) {
    super(props);
    this.state = getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.props.open) {
      const state = getStateFromProps(nextProps);
      if (this.props.open) {
        state.src = null;
      }
      this.setState(state);
    }
  }

  getTitle() {
    const { t, type, readonly } = this.props;
    return t(`title.${readonly ? 'details' : 'edit'}.${type}`);
  }

  handleCloseButtonClick = () => {
    if (this.props.uploading) return;
    this.props.dispatch(Actions.toggle({ open: false }));
  }

  handleUploadButtonClick = () => this.audioUpload.click()

  handleAudioUploadChange = ({ target }) => {
    const file = target.files[0];
    this.setState({
      file,
    });

    this.props.dispatch(Actions.changeAudioUpload());

    // START FILE READER HANDLER
    const fileReader = new FileReader();
    // fileReader.onerror = this.fileReaderErrorHandler;
    // fileReader.onprogress = this.fileReaderUpdateProgress;
    // fileReader.onloadstart = (e) => this.fileReaderStartLoad(e, this);
    // set the div className to loading
    fileReader.readAsDataURL(file);
    fileReader.onload = event => this.setState({
      src: event.target.result,
    });
  }

  handleNameChange = (value) => {
    this.setState(update(this.state, {
      asset: {
        nameEn: { $set: value },
      },
    }));
  }

  handleDeleteAudioButtonClick = () => {
    const { dispatch, t, type } = this.props;
    const { asset } = this.state;
    const { id, libraryId } = asset;
    dispatch(AlertDialog.toggle({
      open: true,
      body: t('label.confirmDelete', {
        name: asset.nameEn,
      }),
      confirmCallback: () => {
        dispatch(LibraryDetailsActions.deleteAsset({
          id,
          libraryId,
          type,
        }));
      },
    }));
  }

  handleCreditsChange = (users) => {
    this.setState(update(this.state, {
      asset: {
        users: { $set: users },
      },
    }));
  }

  handleCreditsUrlChange = (value) => {
    this.setState(update(this.state, {
      asset: {
        creditsUrl: { $set: value },
      },
    }));
  }

  handleConfirmButtonClick = () => {
    const { asset, file } = this.state;
    this.props.dispatch(LibraryDetailsActions.updateAsset(asset, file));
  }

  render() {
    const {
      open, readonly, t, type, uploading, error,
    } = this.props;
    const { asset, file, src } = this.state;

    const deleteButton = (
      <FlatButton
        disabled={uploading}
        label={t(`button.delete.${type}`)}
        onClick={this.handleDeleteAudioButtonClick}
      />
    );

    const valid = (
      asset.nameEn &&
      asset.nameEn.trim().length > 0 &&
      (
        (asset.users && asset.users.length > 0) ||
        (asset.creditsUrl && asset.creditsUrl.length > 0)
      ) &&
      (!file || (file && !isFileSizeExceedLimit(file.size))) // uploaded file and not exceeding size limit
    );

    const confirmButtonProps = {
      rightButtonDisable: !valid || uploading,
      rightButtonTitle: t('save'),
      onClickRightButton: this.handleConfirmButtonClick,
    };

    const className = classNames(
      'edit-audio-modal',
    );

    return (
      <Modal
        className={className}
        open={open}
        onClickOutside={this.handleCloseButtonClick}
      >
        <Modal.Header loading={uploading && !error} onClickCloseButton={this.handleCloseButtonClick}>
          {this.getTitle()}
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Section>
              <Form.Section.Main>
                <input
                  ref={ref => this.audioUpload = ref}
                  accept="audio/x-wav,audio/mpeg3,audio/x-m4a"
                  style={{ display: 'none' }}
                  type="file"
                  onChange={this.handleAudioUploadChange}
                  onClick={() => { this.audioUpload.value = ''; }} // Clear selected files
                />
                {/*
                  // make sure AudioPlayer only did mount when have src ;
                  // here will cause AudioPlayer did mount firstly with old url then receive new url
                */}
                {error && (
                  <span className="edit-audio-error">{t(error)}</span>
                )}
                {!!file && isFileSizeExceedLimit(file.size) &&
                  <span className="edit-audio-error">
                    {t('ERR_AUDIO_FILE_SIZE_TOO_LARGE', {
                      size: MAX_AUDIO_FILE_SIZE.MB,
                    })}
                  </span>
                }
                {src &&
                  <AudioPlayer
                    mode={readonly ? 'readonly' : 'upload'}
                    title={file ? file.name : null}
                    url={src}
                    onClickUploadButton={this.handleUploadButtonClick}
                  />
                }
                <TextField
                  maxLength={30}
                  placeholder={t('uploadMusicModal.placeholder.name')}
                  readonly={uploading || readonly}
                  showWarning={asset.nameEn === ''}
                  value={asset.nameEn}
                  fullWidth
                  onChange={this.handleNameChange}
                />
                <UsersDropdown
                  readonly={readonly}
                  users={asset.users}
                  fullWidth
                  onChange={this.handleCreditsChange}
                />
                <TextField
                  placeholder={t('uploadMusicModal.placeholder.creditsUrl')}
                  readonly={uploading || readonly}
                  showWarning={asset.creditsUrl === ''}
                  value={asset.creditsUrl}
                  fullWidth
                  onChange={this.handleCreditsUrlChange}
                />
              </Form.Section.Main>
            </Form.Section>
          </Form>
        </Modal.Body>
        {!readonly &&
          <Modal.Footer
            leftItems={[deleteButton]}
            {...confirmButtonProps}
          />
        }
      </Modal>
    );
  }
}
