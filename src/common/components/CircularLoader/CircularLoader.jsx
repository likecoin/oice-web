import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import SettingIcon from 'common/icons/setting';

import './CircularLoader.styles.scss';


const CircularLoader = (props) => {
  const {
    id, color, size, loading,
  } = props;
  const style = {
    width: size,
    height: size,
  };
  if (!loading) return null;

  const className = classNames('circular-loader', props.className, color);

  return (
    <div className={className} id={id} style={style} />
  );
};

CircularLoader.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  color: PropTypes.string,
  loading: PropTypes.bool,
  size: PropTypes.number,
};

CircularLoader.defaultProps = {
  className: undefined,
  id: undefined,
  color: undefined,
  loading: true,
  size: 36,
};

export default CircularLoader;
