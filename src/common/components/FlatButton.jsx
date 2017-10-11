import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class FlatButton extends React.Component {
  static displayName = 'FlatButton';

  static defaultProps = {
    buttonGroupIndex: -1,
    disabled: false,
    fullWidth: false,
    mini: false,
    selected: false,
  }

  static propTypes = {
    buttonGroupIndex: PropTypes.number,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    icon: PropTypes.element,
    id: PropTypes.string,
    label: PropTypes.node,
    mini: PropTypes.bool,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  }

  onClick = () => {
    const { onClick, disabled, buttonGroupIndex } = this.props;
    if (onClick && !disabled) onClick(buttonGroupIndex);
  }

  render() {
    const {
      label,
      icon,
      mini,
      selected,
      disabled,
      fullWidth,
    } = this.props;

    const className = classNames('flat-button', this.props.className, {
      icon: icon !== undefined,
      label: label !== undefined,
      mini,
      selected,
      disabled,
      block: fullWidth,
    });

    return (
      <button id={this.props.id} {...{ className }} onClick={this.onClick}>
        {icon}
        {label && <span className="button-label">{label}</span>}
      </button>
    );
  }
}
