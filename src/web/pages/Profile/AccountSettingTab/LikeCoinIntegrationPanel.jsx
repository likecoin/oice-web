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
    const redirectURL = new URL(window.location.href);
    redirectURL.searchParams.append('action', 'register-likecoin');
    window.location.assign(`${LIKECOIN_URL}/register?redirect=${redirectURL.toString()}`);
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

  _renderBanner() {
    const { t, likeCoinId } = this.props;

    return (
      <div className="likecoin-id-banner">
        <div>
          <span className="likecoin-id-label">LikeCoin ID</span>

          {likeCoinId ? (
            <a className="likecoin-payment-url" href={`${LIKECOIN_URL}/${likeCoinId}`}>
              <span className="url">{LIKECOIN_URL}/</span>
              <span className="id">{likeCoinId}</span>
            </a>
          ) : (
            <div className="connect-options">
              <OutlineButton
                label={t('LikeCoinIntegrationPanel.button.register')}
                onClick={this._handleRegisterLikeCoinIdButtonClick}
              />
              <OutlineButton
                label={t('LikeCoinIntegrationPanel.button.login')}
                onClick={this._handleLoginLikeCoinButtonClick}
              />
            </div>
          )}

        </div>
      </div>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <ProfilePanel header={t('LikeCoinIntegrationPanel.title')}>
        <div className="left-column">
          <div>
            {this._renderBanner()}
          </div>
        </div>
      </ProfilePanel>
    );
  }
}
