import React from 'react';
import PropTypes from 'prop-types';

export default function PlayButton({
  labelSize,
  subtitle,
  subtitleSize,
  t,
  title,
  titleSize,
  onClick,
}) {
  return (
    <div className="oice-player-overlay oice-play-button">
      <div className="oice-upnext-info">
        <div
          className="oice-upnext-label"
          style={{ fontSize: labelSize }}
        >
          {t('label.play')}
        </div>
        <div
          className="oice-upnext-subtitle"
          style={{ fontSize: subtitleSize }}
        >
          {subtitle}
        </div>
        <div
          className="oice-upnext-title"
          style={{ fontSize: titleSize }}
        >
          {title}
        </div>

        <div className="oice-upnext-autoplay-button" onClick={onClick}>
          <svg
            height={titleSize * 3}
            version="1.1"
            viewBox="0 0 98 98"
            width={titleSize * 3}
          >
            <path
              d="M32,31.00181 C32,28.7916714 33.5680474,27.8624261 35.4972017,28.9234609 L68.5027983,47.0765391 C70.4342495,48.1388372 70.4319526,49.8624261 68.5027983,50.9234609 L35.4972017,69.0765391 C33.5657505,70.1388372 32,69.2069088 32,66.99819 L32,31.00181 Z"
              fill="#FFF"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

PlayButton.propTypes = {
  labelSize: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  subtitle: PropTypes.string.isRequired,
  subtitleSize: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  titleSize: PropTypes.number.isRequired,
};
