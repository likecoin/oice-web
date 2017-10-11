import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import _isEqual from 'lodash/isEqual';
import { sprintf } from 'sprintf-js';


const calculateRect = (selectors, variables, rect) => {
  if (selectors.length > 0) {
    const nextSelectors = [...selectors];
    let nextRect;
    const selector = nextSelectors.shift();
    const parsedSelector = sprintf(selector, variables);
    const element = document.querySelector(parsedSelector);
    if (element) {
      element.scrollIntoView();
      const elementRect = element.getBoundingClientRect();
      if (!rect) {
        nextRect = {
          top: elementRect.top,
          left: elementRect.left,
          bottom: elementRect.bottom,
          right: elementRect.right,
        };
      } else {
        nextRect = {
          top: Math.min(elementRect.top, rect.top),
          left: Math.min(elementRect.left, rect.left),
          bottom: Math.max(elementRect.bottom, rect.bottom),
          right: Math.max(elementRect.right, rect.right),
        };
      }
    }
    return calculateRect(nextSelectors, variables, nextRect);
  }
  if (rect) {
    return {
      top: rect.top,
      left: rect.left,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
    };
  }
  return null;
};

const RECT_MARGIN = 10; /* Make sure it is equal to $tutorial-overlay-margin */
const getStateFromRect = (rect = {}) => {
  const state = {};
  state.top = (rect.top || 0) - RECT_MARGIN;
  state.left = (rect.left || 0) - RECT_MARGIN;
  state.width = RECT_MARGIN + (rect.width || window.innerWidth) + RECT_MARGIN;
  state.height = RECT_MARGIN + (rect.height || window.innerHeight) + RECT_MARGIN;
  return state;
};

export default class InteractiveTutorialOverlay extends React.Component {
  static propTypes = {
    fullOverlay: PropTypes.bool,
    override: PropTypes.bool,
    selectors: PropTypes.array,
    variables: PropTypes.object,
  }

  static defaultProps = {
    fullOverlay: false,
    override: false,
    selectors: [],
    variables: {},
  }

  constructor(props) {
    super(props);
    this.state = getStateFromRect();
    if (props.selectors.length > 0) {
      this.setTimer();
    } else {
      this.clearTimer();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_isEqual(this.props.selectors, nextProps.selectors)) {
      if (nextProps.selectors.length > 0) {
        this.setTimer();
      } else {
        this.clearTimer();
        if (nextProps.fullOverlay) {
          this.setState({
            top: (this.state.top + this.state.height) / 2,
            left: (this.state.left + this.state.width) / 2,
            width: 0,
            height: 0,
          });
        } else {
          this.setState(getStateFromRect());
        }
      }
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  position = () => {
    const { variables, selectors } = this.props;
    const rect = calculateRect(selectors, variables) || getStateFromRect();
    this.setState(getStateFromRect(rect));
  }

  setTimer() {
    this.clearTimer();
    this.positionTimer = setInterval(this.position, 200);
  }

  clearTimer() {
    if (this.positionTimer) clearInterval(this.positionTimer);
  }

  render() {
    const { override, selectors } = this.props;
    const className = classNames(
      'tutorial-overlay',
      {
        active: selectors === true,
      }
    );

    return (
      <div
        className={className}
        style={this.state}
      >
        <div className="mask-top" />
        <div className="mask-right" />
        <div className="mask-bottom" />
        <div className="mask-left" />
        {override &&
          <div
            className="override-button"
          />
        }
      </div>
    );
  }
}
