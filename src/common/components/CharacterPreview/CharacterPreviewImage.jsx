import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';


export default function CharacterPreviewImage(props) {
  const { image, width, height, flipped, readonly } = props;

  const className = classNames('character-preview-image', { flipped, readonly });

  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundImage: `url("${image}")`,
      }}
    />
  );
}

CharacterPreviewImage.propTypes = {
  image: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  flipped: PropTypes.bool,
  readonly: PropTypes.bool,
};

CharacterPreviewImage.defaultProps = {
  image: PropTypes.string.isRequired,
  width: -1,
  height: -1,
  flipped: false,
  readonly: false,
};
