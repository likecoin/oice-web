import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';

import TestFlightInvitation from 'web/pages/TestFlightInvitation';

import './DownloadAppBadges.styles.scss';


@translate('DownloadAppBadges')
export default class DownloadAppBadges extends React.Component {
  static propTypes = {
    // HoC
    t: PropTypes.func.isRequired,

    // Props
    googleLink: PropTypes.string,
    isDarkBackground: PropTypes.bool,
    isVertical: PropTypes.bool,
    logOnClickAppStoreIcon: PropTypes.func,
    logOnClickGooglePlayIcon: PropTypes.func,
  }

  static defaultProps = {
    googleLink: 'https://play.google.com/store/apps/details?id=com.oice',
    isDarkBackground: false,
    isVertical: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      isTestFlightInvitationModalOpened: false,
    };
  }

  handleOnClickGooglePlayIcon = () => {
    const { googleLink, logOnClickGooglePlayIcon } = this.props;
    if (logOnClickGooglePlayIcon) logOnClickGooglePlayIcon();
    window.location.href = googleLink;
  }

  toggleTestFlightInvitationModal = () => {
    const { logOnClickAppStoreIcon } = this.props;
    const { isTestFlightInvitationModalOpened } = this.state;
    if (logOnClickAppStoreIcon && !isTestFlightInvitationModalOpened) logOnClickAppStoreIcon();
    this.setState({
      isTestFlightInvitationModalOpened: !isTestFlightInvitationModalOpened,
    });
  }

  render() {
    const { t, googleLink, isDarkBackground, isVertical } = this.props;
    const { email } = this.state;

    const rootClassName = classNames('get-app-button-groups', {
      vertical: isVertical,
    });

    const footnoteClassName = classNames('footnote', {
      'dark-background': isDarkBackground,
    });

    return (
      <div className={rootClassName}>
        <span className="get-app-button google-play">
          <a onClick={this.handleOnClickGooglePlayIcon}>
            <img src="/static/img/google-play-badge.png" />
          </a>
        </span>
        <span className="get-app-button app-store">
          <a onClick={this.toggleTestFlightInvitationModal}>
            <img src="/static/img/app-store-badge.svg" />
          </a>
          {/*
          <span className={footnoteClassName}>
            *{t('label.iosTestFootnote')}
          </span>
          */}
        </span>
        <TestFlightInvitation
          open={this.state.isTestFlightInvitationModalOpened}
          onToggle={this.toggleTestFlightInvitationModal}
        />
      </div>
    );
  }
}
