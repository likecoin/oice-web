import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import SettingIcon from 'common/icons/setting';

import './styles.scss';


const Avatar = (props) => {
  const {
    label,
    link,
    mini,
    overlay,
    size,
    src,
    vertical,
    onClick,
  } = props;
  const style = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    fontSize: `${size * (14 / 36)}px`,
  };

  const className = classNames('avatar', props.className, {
    vertical,
    clickable: !!onClick,
  });

  const Wrapper = link ? 'a' : 'div';

  return (
    <Wrapper
      className={className}
      href={link}
      id={props.id}
      onClick={onClick}
    >
      {src ? (
        <img
          alt={label}
          className="avatar-image"
          src={src}
          style={style}
        />
        ) : (
          <div
            className="avatar-letter"
            style={{
              ...style,
              lineHeight: `${size}px`,
            }}
          >
            {label[0] && label[0].toUpperCase()}
          </div>
        )
      }
      {!mini && label &&
        <span className="avatar-label">
          {label}
        </span>
      }
      {overlay &&
        <div className="avatar-overlay">
          <SettingIcon />
        </div>
      }
    </Wrapper>
  );
};

Avatar.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  link: PropTypes.string,
  mini: PropTypes.bool,
  overlay: PropTypes.bool,
  size: PropTypes.number,
  src: PropTypes.string,
  vertical: PropTypes.bool,
  onClick: PropTypes.func,
};

Avatar.defaultProps = {
  label: '',
  link: '',
  mini: false,
  overlay: false,
  size: 36,
  src: '',
  vertical: false,
};

export default Avatar;
