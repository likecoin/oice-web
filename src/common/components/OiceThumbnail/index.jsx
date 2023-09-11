import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

const OiceThumbnail = props => (
  <div
    className="oice-thumbnail"
    style={{ backgroundSize: `${props.size}px` }}
  />
);

OiceThumbnail.propTypes = {
  size: PropTypes.number,
};

OiceThumbnail.defaultProps = {
  size: 100,
};

export default OiceThumbnail;
