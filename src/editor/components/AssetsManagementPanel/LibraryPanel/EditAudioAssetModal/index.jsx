import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';
import update from 'immutability-helper';

import AlertDialog from 'ui-elements/AlertDialog';
import AudioPlayer from 'ui-elements/AudioPlayer';
import AudioUpload from 'ui-elements/AudioUpload';
import FlatButton from 'ui-elements/FlatButton';
import Form from 'ui-elements/Form';
import Modal from 'ui-elements/Modal';
import Progress from 'ui-elements/Progress';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';
import UsersDropdown from 'ui-elements/UsersDropdown';

import CloseIcon from 'common/icons/close';

import * as ASSET_TYPE from 'common/constants/assetTypes';

import { toggleEditAudioAssetModal } from './redux';

import { getAudioMp4Url } from 'editor/utils/app';

import {
  updateAsset,
  deleteAsset,
} from '../actions';

import './styles.scss';

const getStateFromProps = ({ asset }) => {
  const src = getAudioMp4Url(asset);
  return {
    asset: asset || {},
    file: null,
    src,
  };
};


@translate(['assetsManagement', 'general', 'EditAudioAssetModal'])
@connect(store => ({ ...store.libraryPanel.editAudioAssetModal }))
export default class EditAudioAssetModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    uploading: PropTypes.bool.isRequired,
    asset: PropTypes.object,
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

  // FILE READER HANDLER
  fileReaderErrorHandler(e) {
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

  fileReaderUpdateProgress(e) {
    // e is an ProgressEvent.
    if (e.lengthComputable) {
      const percentLoaded = Math.round((e.loaded / e.total) * 100);
      // Increase the progress bar length.
      if (percentLoaded < 100) {
        // MEMO: handle ui progress here
      }
    }
  }

  fileReaderStartLoad = (e, here) => {
    console.log('start from here %o', e);
  };

  handleCloseButtonClick = () => {
    if (this.props.uploading) return;
    this.props.dispatch(toggleEditAudioAssetModal({ open: false }));
  }

  handleUploadButtonClick = () => this.audioUpload.click()

  handleAudioUploadChange = ({ target }) => {
    const file = target.files[0];
    this.setState({
      file,
      showProgressBar: true,
    });

    // START FILE READER HANDLER
    const fileReader = new FileReader();
    // fileReader.onerror = this.fileReaderErrorHandler;
    // fileReader.onprogress = this.fileReaderUpdateProgress;
    // fileReader.onloadstart = (e) => this.fileReaderStartLoad(e, this);
    // set the div className to loading
    fileReader.readAsDataURL(file);
    fileReader.onload = event => this.setState({
      src: event.target.result,
      showProgressBar: false,
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
    dispatch(AlertDialog.toggle({
      open: true,
      body: t('label.confirmDelete', {
        name: asset.nameEn,
      }),
      confirmCallback: () => {
        dispatch(deleteAsset({
          id: asset.id,
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

  handleConfirmButtonClick = () => {
    const { asset, file } = this.state;
    this.props.dispatch(updateAsset(asset, file));
  }

  getTitle() {
    const { t, type, readonly } = this.props;
    return t(`title.${readonly ? 'details' : 'edit'}.${type}`);
  }

  render() {
    const {
      open,
      readonly,
      t,
      type,
      uploading,
    } = this.props;
    const {
      asset,
      file,
      showProgressBar,
      src,
    } = this.state;

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
      asset.users &&
      asset.users.length > 0
    );

    const confirmButton = (
      <RaisedButton
        disabled={!valid || uploading}
        label={t('save')}
        primary
        onClick={this.handleConfirmButtonClick}
      />
    );

    const className = classNames(
      'edit-audio-modal',
    );

    return (
      <Modal className={className} open={open}>
        <Modal.Header
          loading={uploading}
          onClickCloseButton={this.handleCloseButtonClick}
        >
          {this.getTitle()}
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Section>
              <Form.Section.Main>
                <input
                  ref={ref => this.audioUpload = ref}
                  accept="audio/x-wav"
                  style={{ display: 'none' }}
                  type="file"
                  onChange={this.handleAudioUploadChange}
                  onClick={() => { this.audioUpload.value = ''; }} // Clear selected files
                />
                {/*
                  // make sure AudioPlayer only did mount when have src ;
                  // here will cause AudioPlayer did mount firstly with old url then receive new url
                */}
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
              </Form.Section.Main>
            </Form.Section>
          </Form>
        </Modal.Body>
        {!readonly &&
          <Modal.Footer
            leftItems={[deleteButton]}
            rightItems={[confirmButton]}
          />
        }
      </Modal>
    );
  }
}
