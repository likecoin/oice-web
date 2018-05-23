import React from 'react';
import PropTypes from 'prop-types';

import _throttle from 'lodash/throttle';


export default class Throttle extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    time: PropTypes.number,
  }

  constructor(props) {
    super(props);

    this.throttledFunc = undefined;
  }

  componentWillUnmount() {
    if (this.throttledFunc) this.throttledFunc.cancel();
  }

  throttle = (fn) => {
    const { time = 1000 } = this.props;
    if (typeof fn === 'function') {
      this.throttledFunc = _throttle(fn, time);
    } else {
      this.throttledFunc = null;
    }

    return this.throttledFunc;
  }

  render() {
    return this.props.children(this.throttle);
  }
}
