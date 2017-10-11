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

import { actions as LibraryDetailsActions } from 'asset-library/views/LibraryDetails';

import * as Actions from './BackgroundModal.actions';

import './BackgroundModal.style.scss';

const defaultBackgroundState = {
  nameTw: '',
  nameEn: '',
  nameJp: '',
  url: null,
  users: [],
  creditsUrl: ''
};

const getStateFromProps = (props) => ({
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
@connect(store => ({
  ...store.BackgroundModal,
  user: store.user,
}))
export default class BackgroundModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    background: PropTypes.object,
    libraryId: PropTypes.number,
    readonly: PropTypes.bool,
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
    this.props.dispatch(Actions.toggle({ open: false }));
  }

  handleConfirmButtonClick = () => {
    const isAdding = !this.props.background;
    const { background } = this.state;
    const imageFile = this.imageCropper.getImageFile();
    this.props.dispatch(
      isAdding ?
      LibraryDetailsActions.addAsset(background, imageFile, ASSET_TYPE.BACKGROUND) :
      LibraryDetailsActions.updateAsset(background, imageFile, ASSET_TYPE.BACKGROUND)
    );
  }

  handleDeleteButtonClick = () => {
    const { dispatch, background } = this.props;
    const { id, libraryId } = background;
    dispatch(LibraryDetailsActions.deleteAsset({
      type: ASSET_TYPE.BACKGROUND,
      id,
      libraryId,
    }));
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

  handleCreditsUrlChange = (value) => {
    this.setState(update(this.state, {
      background: {
        creditsUrl: { $set: value },
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
        readonly={readonly}
        ref={ref => this.imageCropper = ref}
        src={background.url}
        onReady={this.handleReady}
      />
    );
  }

  render() {
    const { t, open, readonly } = this.props;
    const { background, hasUploadedImage } = this.state;

    const isAdding = !this.props.background;

    const deleteButton = (readonly ? null : (!isAdding &&
      <FlatButton
        label={t('bgModal.button.delete')}
        onClick={this.handleDeleteButtonClick}
      />)
    );
    const isImageUrlEmpty = (!background.url) && !hasUploadedImage;
    const isFilledAssetName = background.nameEn.trim().length > 0;
    const isCreditsEmpty = background.creditsUrl.length <= 0 && (background.users && background.users.length <= 0);
    const valid = !isImageUrlEmpty && isFilledAssetName && !isCreditsEmpty;
    const confirmButton = (readonly ? null : (
      <RaisedButton
        disabled={!valid}
        label={t('bgModal.button.save')}
        primary
        onClick={this.handleConfirmButtonClick}
      />
    ));

    let modalHeader = (
      readonly ?
      t('bgModal.header.view') :
      t(`bgModal.header.${isAdding ? 'add' : 'edit'}`)
    );
    if (!isAdding) modalHeader = `${modalHeader} (${background.id})`;

    return (
      <Modal
        id="background-modal"
        open={open}
        width={398}
        onClickOutside={this.handleCloseModalButtonClick}
      >
        <Modal.Header onClickCloseButton={this.handleCloseModalButtonClick}>
          {modalHeader}
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Section>
              <Form.Section.Main>
                {this.renderImageUpload(readonly)}
                <TextField
                  placeholder={t('bgModal.placeholder.name.en')}
                  readonly={readonly}
                  value={background.nameEn}
                  fullWidth
                  onChange={(e) => this.handleNameChange(e, 'nameEn')}
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
                  readonly={readonly}
                  users={background.users}
                  fullWidth
                  onChange={this.handleCreditsChange}
                />
                <TextField
                  placeholder={t('bgModal.placeholder.creditsUrl')}
                  readonly={readonly}
                  value={background.creditsUrl}
                  fullWidth
                  onChange={this.handleCreditsUrlChange}
                />
              </Form.Section.Main>
            </Form.Section>
          </Form>
        </Modal.Body>
        {!readonly &&
          <Modal.Footer leftItems={[deleteButton]} rightItems={[confirmButton]} />
        }
      </Modal>
    );
  }
}
