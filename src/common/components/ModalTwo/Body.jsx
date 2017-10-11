import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class ModalBody extends React.Component {
  static displayName = 'ModalBody';
  static propTypes = {
    children: PropTypes.node,
    padding: PropTypes.bool,
    style: PropTypes.object,
  };

  static defaultProps = {
    padding: true,
  }

  render() {
    const { padding, style } = this.props;
    const className = classNames('modal-two-body', {
      'no-padding': !padding,
    });

    return (
      <div
        ref={ref => this.modalBody = ref}
        className={className}
        style={style}
      >
        {this.props.children}
      </div>
    );
  }
}
