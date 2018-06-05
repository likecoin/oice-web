import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import uuid from 'uuid';

import './ToggleButton.style.scss';

export default class ToggleButton extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    leftLabel: PropTypes.string,
    rightLabel: PropTypes.string,
    narrow: PropTypes.bool,
    toggled: PropTypes.bool,
    onToggle: PropTypes.func,
  }

  static defaultProps = {
    toggled: false,
    narrow: false,
    leftLabel: undefined,
    rightLabel: undefined,
  }

  constructor(props) {
    super(props);
    this.uuid = uuid.v4();
  }

  handleToggle() {
    const { toggled, onToggle } = this.props;
    const isToggled = !toggled;
    if (onToggle) onToggle(isToggled);
  }

  render() {
    const {
      leftLabel, rightLabel, toggled, narrow,
    } = this.props;
    const hasLabel = leftLabel && rightLabel;
    const className = classNames('toggle-button', this.props.className, {
      narrow,
    });

    const leftLabelClassNames = classNames({
      active: !toggled,
    });
    const rightLabelClassNames = classNames({
      active: toggled,
    });
    return (
      <div {...{ className }}>
        {hasLabel &&
          <span className={leftLabelClassNames}>{leftLabel}</span>
        }
        <input
          checked={toggled}
          className="toggle"
          id={`check-box-${this.uuid}`}
          type="checkbox"
          onChange={() => this.handleToggle()}
        />
        <label className="switch" htmlFor={`check-box-${this.uuid}`} />  {/* eslint-disable-line */}
        {hasLabel &&
          <span className={rightLabelClassNames}>{rightLabel}</span>
        }
      </div>
    );
  }
}
