import React from 'react';
import PropTypes from 'prop-types';

import './AppIcon.style.scss';

const AppIcon = ({ size = 72 }) => (
  <div className="app-icon">
    <img alt="app icon" src="/static/img/app-icon.png" style={{ width: size, height: size }} />
  </div>
);

AppIcon.propTypes = {
  size: PropTypes.number,
};

export default AppIcon;
