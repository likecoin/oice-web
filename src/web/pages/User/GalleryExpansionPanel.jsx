import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';

import classNames from 'classnames';
import scrollIntoView from 'scroll-into-view';

const SPRING_CONFIG = {
  stiffness: 400,
  damping: 50,
};

function getStateFromProps(nextProps, prevProps = {}) {
  return {
    children: (
      prevProps.expanded && !nextProps.expanded ?
      prevProps.children : nextProps.children
    ),
  };
}

export default class GalleryExpansionPanel extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    expanded: PropTypes.bool,
    height: PropTypes.number,
  }

  static defaultProps = {
    expanded: false,
    height: 328,
  }

  constructor(props) {
    super(props);
    this.state = getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStateFromProps(nextProps, this.props));
  }

  handleExpansionAnimationRest = () => {
    if (this.props.expanded) {
      if (this.component) {
       // FIXME: Awkward animation
        scrollIntoView(this.component, {
          time: 200,
          align: {
            top: 1,
          },
        });
      }
    } else {
      this.setState({ children: undefined });
    }
  }

  render() {
    const { expanded, height } = this.props;
    const { children } = this.state;

    const isExpanded = expanded && children;
    const className = classNames(
      'gallery-expansion-panel', {
        expanded: isExpanded,
      }
    );

    return (
      <Motion
        style={{
          height: spring(isExpanded ? height : 0, SPRING_CONFIG),
        }}
        onRest={this.handleExpansionAnimationRest}
      >
        {style => (
          <div
            className={className}
            ref={ref => this.component = ref}
            style={style}
          >
            <div className="gallery-expansion-panel-content-wrapper">
              <div className="gallery-expansion-panel-content">
                {children}
              </div>
            </div>
          </div>
        )}
      </Motion>
    );
  }
}
