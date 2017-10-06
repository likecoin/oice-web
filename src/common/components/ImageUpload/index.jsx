import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Motion, spring } from 'react-motion';

import GreyButton from 'ui-elements/GreyButton';
import AddIcon from 'common/icons/add-thin';

import './style.scss';

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
};

const thumnailHoverSpringParameters = {
  stiffness: 300,
  damping: 20,
};

export default class ImageUpload extends React.Component {
  static defaultProps = {
    whidth: 98,
    height: 98,
    accept: 'image/*',
  }
  static propTypes = {
    accept: PropTypes.string,
    disabled: PropTypes.bool,
    height: PropTypes.number,
    src: PropTypes.any,
    width: PropTypes.number,
    onChangeImage: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      isHover: false,
    };
  }

  handleOnMouseOver = () => { this.setState({ isHover: true }); }
  handleOnMouseOut = () => { this.setState({ isHover: false }); }
  handleOnClickImage = () => {
    const { disabled } = this.props;
    if (disabled) return;
    this.imageUpload.click();
  }
  handleOnChangeImage = ({ target }) => {
    const fileList = [];
    Array.prototype.push.apply(fileList, target.files);
    this.props.onChangeImage(fileList[0]);
  }
  render() {
    const { isHover } = this.state;
    const { width, height, src } = this.props;
    const style = {
      image: {
        height: `${height}px`,
        width: `${width}px`,
        backgroundImage: `url(${src})`,
        backgroundColor: src ? 'black' : '#E6E6E6',
      },
      greyButton: {
        width: `${Math.min(width, height)}px`,
      },
    };
    return (
      <div
        className="setting-og-image-upload"
        style={style.image}
        onClick={this.handleOnClickImage}
        onMouseOut={this.handleOnMouseOut}
        onMouseOver={this.handleOnMouseOver}
      >
        <input
          ref={(e) => { this.imageUpload = e; }}
          accept={this.props.accept}
          style={{ display: 'none' }}
          type="file"
          onChange={this.handleOnChangeImage}
          onClick={() => { this.imageUpload.value = ''; }} // Clear selected files
        />
        {!src &&
          <GreyButton
            className="grey-button"
            icon={<AddIcon />}
            style={style.greyButton}
            onClick={this.handleOnClickUploadImage}
          />
        }
      </div>
    );
  }
}
