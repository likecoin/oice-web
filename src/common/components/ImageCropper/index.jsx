import React from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-cropper';

import ButtonGroup from 'ui-elements/ButtonGroup';
import RaisedButton from 'ui-elements/RaisedButton';

import AddIcon from 'common/icons/add';
import UploadIcon from 'common/icons/upload';
import ZoomInIcon from 'common/icons/ImageCropper/zoomin';
import ZoomOutIcon from 'common/icons/ImageCropper/zoomout';

import { convertDataURLtoFile } from 'common/utils';

import 'cropperjs/dist/cropper.css';
import './styles.scss';

const DEFAULT_CONTAINER_SIZE = 350;
const DEFAULT_CROPBOX_SIZE = 285;
// Note: When difference > 65, cropbox size will be slightly larger than minCropBoxWidth/Height defined

class ImageCropper extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    readonly: PropTypes.bool,
    src: PropTypes.string,
    width: PropTypes.number,
    onReady: PropTypes.func,
  }

  static defaultProps = {
    height: DEFAULT_CONTAINER_SIZE,
    readonly: false,
    src: '',
    width: DEFAULT_CONTAINER_SIZE,
  }

  constructor(props) {
    super(props);
    this.state = {
      imageFile: null,
      ready: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.setState({ ready: false });
    }
  }

  getCroppedImageDataUrl = () => this.cropper.getCroppedCanvas().toDataURL();

  getImageFile = () => convertDataURLtoFile(this.getCroppedImageDataUrl());

  onReady = () => {
    const { onReady } = this.props;
    // initialize image position
    const imageData = this.cropper.getImageData();
    const { naturalHeight, naturalWidth } = imageData;
    const minLength = Math.min(naturalWidth, naturalHeight);
    this.cropper.zoomTo(DEFAULT_CROPBOX_SIZE / minLength);
    if (onReady) onReady();
    this.setState({ ready: true });
  }

  handleImageUploadOnChange = ({ target }) => {
    const imageFile = target.files[0];
    const fileReader = new FileReader();
    if (imageFile) {
      fileReader.readAsDataURL(imageFile);
      fileReader.onload = (event) => {
        this.setState({
          imageFile: event.target.result,
        });
      };
    }
  }

  handleUploadImageButtonClick = () => {
    this.imageUpload.click();
  }

  handleZoomIn = () => {
    this.cropper.zoom(0.01);
  }

  handleZoomOut = () => {
    this.cropper.zoom(-0.01);
  }

  handleCrop = () => {
    // get dataurl here will hurt performance a lot
    // set data here will create infinite loop
  }

  clearCropperImageFile = () => this.setState({ imageFile: null });

  renderImageCropper = () => {
    const {
      height, readonly, src, width,
    } = this.props;
    const { imageFile, ready } = this.state;
    return (
      <div>
        <input
          ref={ref => this.imageUpload = ref}
          accept="image/*"
          style={{ display: 'none' }}
          type="file"
          multiple
          onChange={this.handleImageUploadOnChange}
          onClick={() => this.imageUpload.value = ''} // Clear selected files
        />
        <Cropper
          ref={ref => this.cropper = ref}
          aspectRatio={1}
          center={false}
          crop={this.handleCrop}
          cropBoxMovable={false}
          cropBoxResizable={false}
          dragMode="move"
          guides={false}
          minCropBoxHeight={DEFAULT_CROPBOX_SIZE}
          minCropBoxWidth={DEFAULT_CROPBOX_SIZE}
          ready={this.onReady}
          src={imageFile || src}
          style={{
            height,
            width,
            opacity: (!readonly && ready) ? 1 : 0,
          }}
          toggleDragModeOnDblclick={false}
          autoCrop
        />
        {!readonly &&
          <div className="zoom-buttons">
            <RaisedButton
              icon={<UploadIcon />}
              mini
              onClick={this.handleUploadImageButtonClick}
            />
            <ButtonGroup>
              <RaisedButton
                icon={<ZoomOutIcon />}
                mini
                onClick={this.handleZoomOut}
              />
              <RaisedButton
                icon={<ZoomInIcon />}
                mini
                onClick={this.handleZoomIn}
              />
            </ButtonGroup>
          </div>
        }
      </div>
    );
  }

  render() {
    const {
      height, readonly, src, width,
    } = this.props;
    return (
      <div className="image-cropper" style={{ height, width }}>
        {!readonly && this.renderImageCropper()}
        {readonly &&
          <img
            alt="presentation"
            className="readonly-preview"
            src={src}
          />
        }
        <div
          className="empty-cropper-holder"
          style={{
            display: (this.state.imageFile || this.props.src) ? 'none' : 'flex',
            height: this.props.height,
            width: this.props.width,
          }}
          onClick={this.handleUploadImageButtonClick}
        >
          <AddIcon />
        </div>
      </div>
    );
  }
}

export default ImageCropper;
