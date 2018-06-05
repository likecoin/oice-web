import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function CoordinateLabel(props) {
  const {
    x, y, top, right, bottom, left,
  } = props;
  const className = classNames('coordinate-label', {
    top, right, bottom, left,
  });
  return (
    <div className={className}>{`(${x}, ${y})`}</div>
  );
}

CoordinateLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  top: PropTypes.bool,
  right: PropTypes.bool,
  bottom: PropTypes.bool,
  left: PropTypes.bool,
};

CoordinateLabel.defaultProps = {
  x: 0,
  y: 0,
  top: false,
  right: false,
  bottom: false,
  left: false,
};

export default CoordinateLabel;
