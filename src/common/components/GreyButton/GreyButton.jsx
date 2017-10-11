import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import './GreyButton.style.scss';


function GreyButton(props) {
  const { icon, style, onClick } = props;
  const className = classNames('grey-button', props.className);
  return (
    <div className={className} style={style} onClick={onClick}>
      <div className="icon-wrapper">
        {icon}
      </div>
    </div>
  );
}

GreyButton.propTypes = {
  icon: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

export default GreyButton;
