import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';
import update from 'immutability-helper';

import AlertDialog from 'ui-elements/AlertDialog';
import Dropdown from 'ui-elements/Dropdown';
import FlatButton from 'ui-elements/FlatButton';
import Form from 'ui-elements/Form';
import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';
import UsersDropdown from 'ui-elements/UsersDropdown';

import UploadIcon from 'common/icons/upload';
import AddIcon from 'common/icons/add';

import { DOMAIN_URL } from 'common/constants';
import * as ASSET_TYPE from 'common/constants/assetTypes';

import { actions as LibraryDetailsActions } from 'asset-library/views/LibraryDetails';

import * as Actions from './ItemModal.actions';

import './ItemModal.style.scss';


const defaultBackgroundState = {
  nameTw: '',
  nameEn: '',
  nameJp: '',
  url: null,
  users: [],
  creditsUrl: '',
};

const getStateFromProps = (props) => ({
  imgRatio: {
    x: 1,
    y: 1,
  },
  asset: props.asset || {
    ...defaultBackgroundState,
    libraryId: props.libraryId,
  },
  imageFile: null,
});

@translate(['assetsManagement', 'assets'])
@connect(store => {
  const { open, item } = store.ItemModal;
  return {
    open,
    asset: item,
    user: store.user,
  };
})
export default class ItemModal extends React.Component {
  static defaultProps = {
    displayImageSize: 250,
    maxImageSize: 1080,
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    asset: PropTypes.object,
    displayImageSize: PropTypes.number,
    libraryId: PropTypes.number,
    maxImageSize: PropTypes.number,
    readonly: PropTypes.bool,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = getStateFromProps(props);
    this.imageUpload = document.createElement('input');
    this.imageUpload.type = 'file';
    this.imageUpload.multiple = true;
    this.imageUpload.accept = 'image/png';
    this.imageUpload.onclick = () => this.imageUpload.value = '';
    this.imageUpload.onchange = this.handleImageUploadOnChange;
  }

  componentDidMount() {
    this.resizeImage(this.props.asset);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStateFromProps(nextProps));
    this.resizeImage(nextProps.asset);
  }

  handleUploadImageButtonClick = () => {
    this.imageUpload.click();
  }

  handleImageUploadOnChange = ({ target }) => {
    const { t, user } = this.props;
    const imageFile = target.files[0];
    const fileReader = new FileReader();
    if (imageFile) {
      fileReader.readAsDataURL(imageFile);
      fileReader.onload = (event) => {
        const src = event.target.result;
        const image = new Image();
        image.src = src;
        image.onload = () => {
          if (image.width > 1080 || image.height > 1080) {
            this.props.dispatch(AlertDialog.toggle({
              body: t('itemModal.label.imageSizeNotLessThan1080'),
              type: 'alert',
            }));
            return;
          }
          const asset = { ...this.state.asset };
          asset.url = event.target.result;
          asset.users = [user];
          this.setState({
            imageFile,
            asset,
          });
          this.resizeImage(asset);
        };
      };
    }
  }

  handleCloseModalButtonClick = () => {
    this.props.dispatch(Actions.toggle({ open: false }));
  }

  handleConfirmButtonClick = () => {
    const isAdding = !this.props.asset;
    const { asset, imageFile } = this.state;
    this.props.dispatch(
      isAdding ?
      LibraryDetailsActions.addAsset(asset, imageFile, ASSET_TYPE.ITEM) :
      LibraryDetailsActions.updateAsset(asset, imageFile, ASSET_TYPE.ITEM)
    );
  }

  handleDeleteButtonClick = () => {
    const { asset, dispatch } = this.props;
    const { id, libraryId } = asset;
    dispatch(
      LibraryDetailsActions.deleteAsset({
        type: ASSET_TYPE.ITEM,
        id,
        libraryId,
      })
    );
  }

  handleNameChange = (value, key) => {
    const asset = { ...this.state.asset };
    asset[key] = value;
    this.setState({ asset });
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

  resizeImage(asset) {
    if (asset && asset.url) {
      const { maxImageSize } = this.props;
      const { imgRatio } = this.state;

      const img = new Image();
      img.src = asset.url;

      img.onload = () => {
        imgRatio.x = img.width / maxImageSize;
        imgRatio.y = img.height / maxImageSize;
        this.setState({ imgRatio });
      };
    }
  }

  renderImageUpload() {
    // TODO: Componentize, share with asset form in attribute panel
    const {
      displayImageSize,
      maxImageSize,
      readonly,
    } = this.props;

    const {
      asset,
      imgRatio,
      imageFile,
    } = this.state;

    const isEmpty = (!asset.url);

    const topLeftCoordinateClassName = classNames('coordinates top-left-coordinate', {
      light: !isEmpty,
    });

    const bottomRightCoordinateClassName = classNames('coordinates bottom-right-coordinate', {
      light: !isEmpty,
    });

    const uploadButtonClassName = classNames(
      'control-icon',
      isEmpty ? 'add' : 'upload'
    );

    return (
      <div>
        <div className={topLeftCoordinateClassName}>(0,0)</div>
        <div className={bottomRightCoordinateClassName}>
          ({maxImageSize},{maxImageSize})
        </div>
        <div className="background-card-image">
          {isEmpty && <div className="empty-holder" />}
          {!isEmpty &&
            <img
              alt="presentation"
              height={displayImageSize * imgRatio.y}
              src={asset.url}
              width={displayImageSize * imgRatio.x}
            />
          }
          {!isEmpty && <div className="crop-shadow-inner-border" />}
          {!isEmpty && <div className="crop-shadow" />}
          <div
            className={uploadButtonClassName}
            onClick={this.handleUploadImageButtonClick}
          >
            {!readonly && (isEmpty ? <AddIcon /> : <UploadIcon />)}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      t,
      open,
      readonly,
    } = this.props;
    const { asset } = this.state;

    const isAdding = !this.props.asset;

    const deleteButton = (readonly ? null : (!isAdding &&
      <FlatButton
        label={t('itemModal.button.delete')}
        onClick={this.handleDeleteButtonClick}
      />)
    );

    const isImageUrlEmpty = (!asset.url);
    const isFilledAssetName = asset.nameEn.trim().length > 0;
    const isCreditsEmpty = asset.creditsUrl.length <= 0 && (asset.users && asset.users.length <= 0);

    const valid = !isImageUrlEmpty && isFilledAssetName && !isCreditsEmpty;
    const confirmButton = (readonly ? null : (<RaisedButton
      disabled={!valid}
      label={t('itemModal.button.save')}
      primary
      onClick={this.handleConfirmButtonClick}
    />)
    );

    return (
      <Modal
        id="background-modal"
        open={open}
        width={398}
        onClickOutside={this.handleCloseModalButtonClick}
      >
        <Modal.Header
          onClickCloseButton={this.handleCloseModalButtonClick}
        >
          {readonly ?
            t('itemModal.header.view') :
            t(`itemModal.header.${isAdding ? 'add' : 'edit'}`)
          }
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Section>
              <Form.Section.Main>
                {this.renderImageUpload()}
                <TextField
                  placeholder={t('itemModal.placeholder.name.en')}
                  readonly={readonly}
                  value={asset.nameEn}
                  fullWidth
                  onChange={(e) => this.handleNameChange(e, 'nameEn')}
                />
                {/* <TextField
                  placeholder={t('itemModal.placeholder.name.tw')}
                  onChange={(e) => this.handleNameChange(e, 'nameTw')}
                  value={asset.nameTw}
                  fullWidth
                  />
                  <TextField
                  placeholder={t('itemModal.placeholder.name.jp')}
                  onChange={(e) => this.handleNameChange(e, 'nameJp')}
                  value={asset.nameJp}
                  fullWidth
                /> */}
                {/* <Dropdown
                  values={['陰森陰森陰森陰森陰森', '明媚', '溫韾', '可怕', '黑暗']}
                  selectedIndexes={[]}
                  multiple
                  showCount
                  search
                  limit={3}
                  searchPlaceholder={t('itemModal.placeholder.tag')}
                  searchNotFoundText={t('itemModal.label.tagNotFound')}
                  fullWidth
                /> */}
                <UsersDropdown
                  readonly={readonly}
                  users={asset.users}
                  fullWidth
                  onChange={this.handleCreditsChange}
                />
                <TextField
                  placeholder={t('itemModal.placeholder.creditsUrl')}
                  readonly={readonly}
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
            rightItems={[confirmButton]}
          />
        }
      </Modal>
    );
  }
}
