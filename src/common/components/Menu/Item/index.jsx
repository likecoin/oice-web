import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './styles.scss';

export default class MenuItem extends React.Component {
  static displayName = 'MenuItem';
  static propTypes = {
    disabled: PropTypes.bool,
    primaryText: PropTypes.string,
    secondaryText: PropTypes.string,
    icon: PropTypes.element,
    onClick: PropTypes.func,
    onRequestClose: PropTypes.func,
  }
  static defaultProps = {
    disabled: false,
    primaryText: '',
  }

  handleClick = () => {
    const { onClick, onRequestClose } = this.props;
    onRequestClose();
    if (onClick) onClick();
  }

  render() {
    const {
      disabled, primaryText, secondaryText, icon,
    } = this.props;

    const className = classNames('menu-item', {
      disabled,
    });

    return (
      <div
        className={className}
        onClick={this.handleClick}
      >
        {primaryText}
        {secondaryText && <div className="menu-secondary-text">{secondaryText}</div>}
        {icon && <span className="menu-item-icon">{icon}</span>}
      </div>
    );
  }
}
