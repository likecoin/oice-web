import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import './style.scss';


export default class ResizedImage extends React.Component {
  static propTypes = {
    src: PropTypes.string,
    width: PropTypes.number,
    centerImage: PropTypes.bool,
    imageStyle: PropTypes.object,
    maskImageStyle: PropTypes.object,
  }

  static defaultProps = {
    centerImage: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      ratio: {
        x: 1,
        y: 1,
      },
      loading: false,
    };

    const { src } = props;
    if (src !== '') {
      this.state.loading = true;
      this.updateRatio(src);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { src } = nextProps;
    if (src !== '' && this.props.src !== src) {
      this.setState({ loading: true });
      this.updateRatio(src);
    }
  }

  updateRatio = (imageSrc) => {
    const ratio = {
      x: 1,
      y: 1,
    };
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ratio.x = img.width / 1080;
      ratio.y = img.height / 1080;
      this.setState({ ratio, loading: false });
    };
  }

  render() {
    const { src, width, centerImage, imageStyle, maskImageStyle } = this.props;
    const { ratio, loading } = this.state;

    const position = {
      top: 0,
      left: 0,
    };
    const imageWidth = width * ratio.x;
    const imageHeight = width * ratio.y;
    if (width > imageWidth) position.left = (width - imageWidth) / 2;
    if (width > imageHeight) position.top = (width - imageHeight) / 2;

    const style = { width, height: width, overflow: 'hidden' };
    if (centerImage) {
      style.paddingTop = `${position.top}px`;
      style.paddingLeft = `${position.left}px`;
    }

    return (
      <div className="resized-image-container" style={style}>
        {!loading &&
          <img
            src={src}
            width={imageWidth}
            height={imageHeight}
            alt=""
            style={imageStyle}
          />
        }
        {!loading && !!maskImageStyle &&
          <div
            className="mask-image"
            style={{
              top: position.top,
              left: position.left,
              width: imageWidth,
              height: imageHeight,
              WebkitMaskImage: `url(${src})`,
              maskImage: `url(${src})`,
              ...maskImageStyle,
            }}
          />
        }
      </div>
    );
  }
}
