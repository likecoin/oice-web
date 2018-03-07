import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _pick from 'lodash/pick';

import CircularLoader from 'ui-elements/CircularLoader';
import LoadingScreen from 'ui-elements/LoadingScreen';
import OutlineButton from 'ui-elements/OutlineButton';

import LikeCoinManager from 'common/utils/LikeCoin';

import {
  DOMAIN_URL,
  LIKECOIN_URL,
  SRV_ENV,
} from 'common/constants';

import ProfilePanel from '../ProfilePanel';

import * as Actions from '../Profile.actions';

import {
  BASIC_INFORMATION,
  BASIC_INFORMATION_LEFT_ITEMS,
} from '../Profile.constants';

import './LikeCoinIntegrationPanel.styles.scss';


function getLikeCoinRegistrationURL() {
  const redirectURL = new URL(window.location.href);
  redirectURL.searchParams.append('action', 'register-likecoin');
  return `${LIKECOIN_URL}/register?redirect=${redirectURL.toString()}`;
}


@connect((store) => {
  const { id, ...props } = _pick(store.Profile.userProfile, [
    'id',
    'likeCoinId',
  ]);
  return {
    ...props,
    userId: id,
  };
})
@translate('Profile')
export default class LikeCoinIntegrationPanel extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    userId: PropTypes.number,
    likeCoinId: PropTypes.string,
  }

  componentDidMount() {
    const url = new URL(window.location.href);
    const action = url.searchParams.get('action');
    switch (action) {
      case 'register-likecoin': {
        const likeCoinId = url.searchParams.get('likecoinId');
        if (likeCoinId) {
          this.props.dispatch(Actions.connectLikeCoin({ likeCoinId }));
        }
        break;
      }
      default:
    }
  }

  _handleRegisterLikeCoinIdButtonClick = () => {
    window.location.assign(getLikeCoinRegistrationURL());
  }

  _handleLoginLikeCoinButtonClick = () => {
    LikeCoinManager.init({
      isTestNet: SRV_ENV !== 'production',
      onConnect: this._handleLikeCoinManagerConnect,
      onError: this._handleLikeCoinManagerError,
    });
  }

  _handleLikeCoinManagerConnect = async () => {
    const { userId } = this.props;
    LikeCoinManager.removeConnectionListener();
    const address = LikeCoinManager.getWalletAddress();
    const signature = await LikeCoinManager.signObject({ userId, address });
    this.props.dispatch(Actions.connectLikeCoin({ address, signature }));
  }

  _handleLikeCoinManagerError = (error) => {
    console.error(error.message);
  }

  _renderConnectedBanner() {
    const { t, likeCoinId } = this.props;

    return (
      <div className="connected">
        <div>

          <div className="likecoin-id-label">
            <span>{t('LikeCoinIntegrationPanel.label.id')}</span>
            <a
              className="likecoin-user-url blue"
              href={`${LIKECOIN_URL}/${likeCoinId}`}
            >
              {likeCoinId}
            </a>
          </div>

          <div className="likecoin-wallet-info">
            <div>

              <span>{t('LikeCoinIntegrationPanel.label.soonStart')}</span>
              <span>{t('LikeCoinIntegrationPanel.label.yourLikeCoinWillBeDisplayedHere')}</span>

            </div>
          </div>

        </div>
      </div>
    );
  }

  _renderNotYetConnectBanner() {
    const { t } = this.props;
    return (
      <div className="unconnected">
        <div>

          <div className="description">
            <p
              className="content"
              dangerouslySetInnerHTML={{
                __html: t('LikeCoinIntegrationPanel.label.content', {
                  link: getLikeCoinRegistrationURL(),
                }),
              }}
            />
            <p className="footnote">{t('LikeCoinIntegrationPanel.label.footnote')}</p>
          </div>

          <div className="action-buttons">
            <OutlineButton
              label={t('LikeCoinIntegrationPanel.button.register')}
              onClick={this._handleRegisterLikeCoinIdButtonClick}
            />
            <a className="dark-grey" onClick={this._handleLoginLikeCoinButtonClick}>
              {t('LikeCoinIntegrationPanel.button.login')}
            </a>
          </div>

        </div>
      </div>
    );
  }

  render() {
    const { t, likeCoinId } = this.props;

    return (
      <ProfilePanel
        className="likecoin-integration-panel"
        header={t('LikeCoinIntegrationPanel.title')}
        customHeaderRightComponent={(
          <a
            className="more-info-link light-grey"
            href="https://likecoin.store"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('LikeCoinIntegrationPanel.button.whatIsLikeCoin')}
          </a>
        )}
      >
        <div className="likecoin-integration-panel-container">

          <div className="likecoin-connect-banner">
            {likeCoinId ?
              this._renderConnectedBanner()
            :
              this._renderNotYetConnectBanner()
            }
          </div>

        </div>
      </ProfilePanel>
    );
  }
}
