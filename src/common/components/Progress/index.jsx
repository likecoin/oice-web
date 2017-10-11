import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from 'material-ui/LinearProgress';
import LoadingIndicator from './LoadingIndicator';


const color = '#42BD4D';

function Progress(props) {
  return (
    <LinearProgress
      color={color}
      max={props.max}
      mode={props.determinate ? 'determinate' : 'indeterminate'}
      value={props.value}
    />
  );
}

Progress.propTypes = {
  max: PropTypes.number,
  determinate: PropTypes.bool,
  value: PropTypes.number,
};

Progress.defaultProps = {
  max: 100,
  determinate: false,
  value: 0,
};

Progress.LoadingIndicator = LoadingIndicator;

export default Progress;
