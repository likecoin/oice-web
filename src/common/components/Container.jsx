import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class Container extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    isExtended: PropTypes.bool,
    fluid: PropTypes.bool,
    id: PropTypes.string,
  }

  static defaultProps = {
    fluid: false,
    isExtended: false,
  }

  getContainerElement = () => this.container

  render() {
    const {
      id, fluid, isExtended, children,
    } = this.props;
    const className = classNames(
      'container-wrapper',
      {
        fluid,
        extended: isExtended,
      },
      this.props.className
    );
    return (
      <div {...{ id, className }}>
        <div ref={ref => this.container = ref} className="container">
          {children}
        </div>
      </div>
    );
  }
}
