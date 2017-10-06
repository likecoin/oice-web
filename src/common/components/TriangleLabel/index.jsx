import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './style.scss';

const TriangleLabel = (props) => {
  const { id, reference, selected, selectedColor } = props;
  const className = classNames('triangle-label', {
    selected,
  });

  const handleOnClick = () => {
    if (props.onClick) props.onClick();
  };

  return (
    <div {...{ id, className, ref: reference }} onClick={handleOnClick}>
      <div
        className="triangle-background"
        style={{ borderTopColor: selectedColor }}
      />
      {props.icon}
    </div>
  );
};

TriangleLabel.propTypes = {
  id: PropTypes.string,
  reference: PropTypes.any,
  icon: PropTypes.node,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  selectedColor: PropTypes.string,
};

TriangleLabel.defaultProps = {
  selected: false,
};

export default TriangleLabel;
