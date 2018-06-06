import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class RaisedButton extends React.Component {
  static displayName = 'RaisedButton';

  static propTypes = {
    buttonGroupIndex: PropTypes.number,
    className: PropTypes.string,
    color: PropTypes.string,
    destructive: PropTypes.bool,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    icon: PropTypes.element,
    id: PropTypes.string,
    label: PropTypes.node,
    mini: PropTypes.bool,
    primary: PropTypes.bool,
    reverse: PropTypes.bool,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    primary: false,
    destructive: false,
    reverse: false,
    mini: false,
    selected: false,
    disabled: false,
    fullWidth: false,
    buttonGroupIndex: -1,
  }

  handleClick = (e) => {
    const { onClick, disabled, buttonGroupIndex } = this.props;
    if (onClick && !disabled) onClick(e, buttonGroupIndex);
  }

  click = () => {
    this.button.click();
  }

  render() {
    const {
      label,
      icon,
      primary,
      destructive,
      mini,
      selected,
      disabled,
      fullWidth,
      reverse,
      color,
    } = this.props;

    const className = classNames('raised-button', this.props.className, {
      icon: icon !== undefined,
      label: label !== undefined,
      primary,
      destructive,
      reverse,
      mini,
      selected,
      disabled,
      block: fullWidth,
    });

    return (
      <div
        id={this.props.id}
        {...{ className }}
        ref={ref => this.button = ref}
        style={{ color }}
        onClick={this.handleClick}
      >
        {icon}
        {label && <span className="button-label" >{label}</span>}
      </div>
    );
  }
}
