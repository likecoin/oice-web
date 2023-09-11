import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';
import update from 'immutability-helper';

import { DOMAIN_URL } from 'common/constants';
import * as ASSET_TYPE from 'common/constants/assetTypes';

import FlatButton from 'ui-elements/FlatButton';
import Form from 'ui-elements/Form';
import ImageCropper from 'ui-elements/ImageCropper';
import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';
import UsersDropdown from 'ui-elements/UsersDropdown';

import { toggleBackgroundModal } from './redux';

import {
  addAsset,
  updateAsset,
  deleteAsset,
} from '../actions';

import './styles.scss';

const defaultBackgroundState = {
  nameTw: '',
  nameEn: '',
  nameJp: '',
  url: null,
  users: [],
};

const getStateFromProps = props => ({
  imgRatio: {
    x: 1,
    y: 1,
  },
  background: props.background || {
    ...defaultBackgroundState,
    libraryId: props.libraryId,
  },
  hasUploadedImage: false,
});

@translate(['assetsManagement', 'assets'])
@connect((store) => {
  const { open, background } = store.libraryPanel.backgroundModal;
  const { selectedLibrary } = store.libraryPanel;
  const { user } = store;
  return {
    open,
    background,
    libraryId: selectedLibrary ? selectedLibrary.id : null,
    user,
  };
})
export default class BackgroundModal extends React.Component {
  static defaultProps = {
    displayImageSize: 250,
    maxImageSize: 1080,
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    background: PropTypes.object,
    displayImageSize: PropTypes.number,
    libraryId: PropTypes.number,
    limitedMode: PropTypes.bool,
    maxImageSize: PropTypes.number,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStateFromProps(nextProps));
    if (nextProps.open && !this.props.open && this.imageCropper) {
      this.imageCropper.clearCropperImageFile();
    }
  }

  handleUploadImageButtonClick = () => {
    this.imageUpload.click();
  }

  handleCloseModalButtonClick = () => {
    if (this.imageCropper) {
      this.imageCropper.clearCropperImageFile();
    }
    this.props.dispatch(toggleBackgroundModal({ open: false }));
  }

  handleConfirmButtonClick = () => {
    const isAdding = !this.props.background;
    const { background } = this.state;
    const imageFile = this.imageCropper.getImageFile();
    this.props.dispatch(
      isAdding ?
        addAsset(background, imageFile, ASSET_TYPE.BACKGROUND) :
        updateAsset(background, imageFile, ASSET_TYPE.BACKGROUND)
    );
  }

  handleDeleteButtonClick = () => {
    this.props.dispatch(
      deleteAsset({
        id: this.props.background.id,
        type: ASSET_TYPE.BACKGROUND,
      })
    );
  }

  handleNameChange = (value, key) => {
    const background = { ...this.state.background };
    background[key] = value;
    this.setState({ background });
  }

  handleCreditsChange = (users) => {
    this.setState(update(this.state, {
      background: {
        users: { $set: users },
      },
    }));
  }

  handleReady = () => {
    const { user } = this.props;
    const { background } = this.state;
    if (!background.url) {
      // first upload of image
      const newBackground = {
        ...background,
        users: [user],
      };
      this.setState({
        background: newBackground,
        hasUploadedImage: true,
      });
    }
  }

  renderImageUpload = (readonly) => {
    const { background, hasUploadedImage } = this.state;
    return (
      <ImageCropper
        ref={ref => this.imageCropper = ref}
        readonly={readonly}
        src={background.url}
        onReady={this.handleReady}
      />
    );
  }

  render() {
    const {
      t,
      open,
      limitedMode,
    } = this.props;
    const {
      background,
      hasUploadedImage,
    } = this.state;

    const isAdding = !this.props.background;

    const deleteButton = (limitedMode ? null : (!isAdding &&
      <FlatButton
        label={t('bgModal.button.delete')}
        onClick={this.handleDeleteButtonClick}
      />)
    );
    const isImageUrlEmpty = (!background.url) && !hasUploadedImage;
    const isFilledAssetName = background.nameEn.trim().length > 0;
    const isCreditsEmpty = background.users && background.users.length <= 0;

    const valid = !isImageUrlEmpty && isFilledAssetName && !isCreditsEmpty;
    const confirmButton = (limitedMode ? null : (
      <RaisedButton
        disabled={!valid}
        label={t('bgModal.button.save')}
        primary
        onClick={this.handleConfirmButtonClick}
      />
    ));

    return (
      <Modal
        id="background-modal"
        open={open}
        width={398}
      >
        <Modal.Header
          onClickCloseButton={this.handleCloseModalButtonClick}
        >
          {
            limitedMode ?
            t('bgModal.header.view') :
            t(`bgModal.header.${isAdding ? 'add' : 'edit'}`)
          }
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Section>
              <Form.Section.Main>
                {this.renderImageUpload(limitedMode)}
                <TextField
                  placeholder={t('bgModal.placeholder.name.en')}
                  readonly={limitedMode}
                  value={background.nameEn}
                  fullWidth
                  onChange={e => this.handleNameChange(e, 'nameEn')}
                />
                {/* <TextField
                  placeholder={t('bgModal.placeholder.name.tw')}
                  onChange={(e) => this.handleNameChange(e, 'nameTw')}
                  value={background.nameTw}
                  fullWidth
                  />
                  <TextField
                  placeholder={t('bgModal.placeholder.name.jp')}
                  onChange={(e) => this.handleNameChange(e, 'nameJp')}
                  value={background.nameJp}
                  fullWidth
                /> */}
                <UsersDropdown
                  readonly={limitedMode}
                  users={background.users}
                  fullWidth
                  onChange={this.handleCreditsChange}
                />
              </Form.Section.Main>
            </Form.Section>
          </Form>
        </Modal.Body>
        {!limitedMode &&
          <Modal.Footer
            leftItems={[deleteButton]}
            rightItems={[confirmButton]}
          />
        }
      </Modal>
    );
  }
}
