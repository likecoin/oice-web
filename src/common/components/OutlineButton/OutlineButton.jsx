import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './OutlineButton.style.scss';


function OutlineButton(props) {
  const { color, disabled, fluid, icon, label, width } = props;

  const className = classNames(
    'outline-button',
    props.className,
    color,
    {
      disabled,
      fluid,
    }
  );

  return (
    <div
      className={className}
      style={{ minWidth: width }}
      role="button"
      onClick={disabled ? null : props.onClick}
    >
      {icon ? (
        <div className="icon">{icon}</div>
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
}

OutlineButton.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf(['red', 'green', 'blue', 'light-grey']),
  disabled: PropTypes.bool,
  fluid: PropTypes.bool,
  icon: PropTypes.element,
  label: PropTypes.string,
  width: PropTypes.number,
  onClick: PropTypes.func,
};

OutlineButton.defaultProps = {
  className: undefined,
  color: undefined,
  disabled: false,
  fluid: false,
  icon: undefined,
  label: undefined,
  width: undefined,
};

export default OutlineButton;
