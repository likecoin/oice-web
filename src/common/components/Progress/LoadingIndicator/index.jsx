import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

function LoadingIndicator(props) {
  return (
    <div className="loading-indicator" style={props.style}>
      <div className="loading-indicator-elements">
        <div className="circle-1" />
        <div className="circle-2" />
        <div className="circle-3" />
      </div>
    </div>
  );
}

LoadingIndicator.propTypes = {
  style: PropTypes.object,
};

LoadingIndicator.defaultProps = {
  style: undefined,
};

export default LoadingIndicator;
