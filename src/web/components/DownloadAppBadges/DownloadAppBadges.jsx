import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';

import {
  APP_STORE_LINK,
  GOOGLE_PLAY_LINK,
} from 'common/constants/key';

import './DownloadAppBadges.styles.scss';


function DownloadAppBadges(props) {
  const { t, appleLink, googleLink, isDarkBackground, isVertical } = props;

  const rootClassName = classNames('get-app-button-groups', {
    vertical: isVertical,
  });

  const footnoteClassName = classNames('footnote', {
    'dark-background': isDarkBackground,
  });

  return (
    <div className={rootClassName}>
      <span className="get-app-button google-play">
        <a href={googleLink} onClick={props.logOnClickGooglePlayIcon}>
          <img alt="Google Play" src="/static/img/google-play-badge.png" />
        </a>
      </span>
      <span className="get-app-button app-store">
        <a href={appleLink} onClick={props.logOnClickAppStoreIcon}>
          <img alt="App Store" src="/static/img/app-store-badge.svg" />
        </a>
      </span>
    </div>
  );
}

DownloadAppBadges.propTypes = {
  // HoC
  t: PropTypes.func.isRequired,

  // Props
  appleLink: PropTypes.string,
  googleLink: PropTypes.string,
  isDarkBackground: PropTypes.bool,
  isVertical: PropTypes.bool,
  logOnClickAppStoreIcon: PropTypes.func,
  logOnClickGooglePlayIcon: PropTypes.func,
};

DownloadAppBadges.defaultProps = {
  appleLink: APP_STORE_LINK,
  googleLink: GOOGLE_PLAY_LINK,
  isDarkBackground: false,
  isVertical: false,
};

export default translate('DownloadAppBadges')(DownloadAppBadges);
