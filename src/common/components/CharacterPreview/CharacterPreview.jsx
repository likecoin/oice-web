import React from 'react';
import PropTypes from 'prop-types';
import Measure from 'react-measure';

import classNames from 'classnames';
import _get from 'lodash/get';

import { OICE_SIZE } from './CharacterPreview.constants';

import CharacterPreviewDragPreviewLayer from './CharacterPreviewDragPreviewLayer';
import CharacterPreviewDroppableContainer from './CharacterPreviewDroppableContainer';
import CharacterPreviewDraggableItem from './CharacterPreviewDraggableItem';
import CharacterPreviewImage from './CharacterPreviewImage';
import Progress from '../Progress';

import './CharacterPreview.style.scss';


export default class CharacterPreview extends React.Component {
  static propTypes = {
    image: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    flipped: PropTypes.bool,
    readonly: PropTypes.bool,
    size: PropTypes.number,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    image: undefined,
    x: 0,
    y: 0,
    flipped: false,
    readonly: false,
    size: undefined,
  }

  constructor(props) {
    super(props);

    this.state = {
      imageDataURL: undefined,
      loading: false,
      width: -1,
      height: -1,
    };
  }

  componentDidMount() {
    const { image, readonly } = this.props;
    this.loadImage(image, readonly);
  }

  componentWillReceiveProps(nextProps) {
    const { image, readonly } = nextProps;
    if (image !== this.props.image) {
      this.loadImage(image, readonly);
    }
  }

  loadImage(imageURL, readonly) {
    if (!imageURL) {
      this.setState({
        loading: false,
        imageDataURL: undefined,
      });
      return;
    }

    this.setState({
      loading: true,
      imageDataURL: undefined,
    });

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const { width, height } = image;

      // Resize image
      const canvas = document.createElement('canvas');
      const quality = readonly ? 0.4 : 0.6;
      canvas.width = width * quality;
      canvas.height = height * quality;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageDataURL = canvas.toDataURL('image/png');

      this.setState({
        imageDataURL,
        loading: false,
        width,
        height,
      });
    };
    image.src = imageURL;
  }

  renderMeasuredChildren = (dimensions) => {
    const { x, y, flipped, readonly } = this.props;
    const { imageDataURL } = this.state;

    const ratio = dimensions.width / OICE_SIZE;
    const relativeWidth = this.state.width * ratio;
    const relativeHeight = this.state.height * ratio;

    const handleDrop = (relativeX, relativeY) => {
      const coordinates = [
        Math.round(relativeX / ratio),
        Math.round(relativeY / ratio),
      ];
      if (this.props.onChange) {
        this.props.onChange(...coordinates);
      }
    };

    const characterPreviewImage = (
      imageDataURL &&
      <CharacterPreviewImage
        image={imageDataURL}
        width={relativeWidth}
        height={relativeHeight}
        flipped={flipped}
        readonly={readonly}
      />
    );

    return (
      <div>
        <CharacterPreviewDroppableContainer onDrop={handleDrop}>
          <CharacterPreviewDraggableItem x={x * ratio} y={y * ratio} readonly={readonly}>
            {characterPreviewImage}
          </CharacterPreviewDraggableItem>
        </CharacterPreviewDroppableContainer>
        {!readonly &&
          <CharacterPreviewDragPreviewLayer ratio={ratio}>
            {characterPreviewImage}
          </CharacterPreviewDragPreviewLayer>
        }
      </div>
    );
  }

  render() {
    const { size, readonly } = this.props;
    const { loading } = this.state;

    const className = classNames('character-preview', { readonly });

    return (
      <div className={className} style={{ width: size || '100%', paddingTop: size || '100%' }}>
        {!readonly && <hr className="guideline cross horizontal" />}
        {!readonly && <hr className="guideline cross vertical" />}
        <div>
          <Measure>{this.renderMeasuredChildren}</Measure>
        </div>
        {loading && <Progress.LoadingIndicator />}
      </div>
    );
  }
}
