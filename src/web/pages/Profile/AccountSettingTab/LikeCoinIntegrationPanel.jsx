import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';
import Modal from 'boron/DropModal';

import _pick from 'lodash/pick';

import CircularLoader from 'ui-elements/CircularLoader';
import LoadingScreen from 'ui-elements/LoadingScreen';
import OutlineButton from 'ui-elements/OutlineButton';
import RaisedButton from 'ui-elements/RaisedButton';

import {
  DOMAIN_URL,
  LIKECOIN_URL,
} from 'common/constants';

import LikeCoinLoginModal from './LikeCoinLoginModal';
import ProfilePanel from '../ProfilePanel';

import * as Actions from '../Profile.actions';

import {
  BASIC_INFORMATION,
  BASIC_INFORMATION_LEFT_ITEMS,
} from '../Profile.constants';

import './LikeCoinIntegrationPanel.styles.scss';


function getLikeCoinRegistrationURL() {
  const redirectURL = new URL(window.location.href);
  redirectURL.searchParams.append('likecoinaction', 'register-likecoin');
  return `${LIKECOIN_URL}/register?redirect=${redirectURL.toString()}`;
}


@connect((store) => {
  const { id, ...props } = _pick(store.Profile.userProfile, [
    'id',
    'likeCoinId',
  ]);

  const { likecoinaction, likecoinId } = store.routing.locationBeforeTransitions.query;
  return {
    ...props,
    hasError: store.Profile.hasLikeCoinError,
    userId: id,
    action: likecoinaction,
    registeredLikeCoinId: likecoinId,
  };
})
@translate(['general', 'Profile'])
export default class LikeCoinIntegrationPanel extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    userId: PropTypes.number,
    likeCoinId: PropTypes.string,
    action: PropTypes.string,
    registeredLikeCoinId: PropTypes.string,
  }

  componentDidMount() {
    const { action, registeredLikeCoinId } = this.props;
    switch (action) {
      case 'register-likecoin': {
        if (registeredLikeCoinId) {
          this.props.dispatch(Actions.connectLikeCoin({ likeCoinId: registeredLikeCoinId }));
        }
        break;
      }
      default:
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.hasError && nextProps.hasError) {
      if (this._likeCoinModal) this._likeCoinModal.hide();
    } else if (nextProps.likeCoinId) {
      this._handleLikeCoinCloseConnection();
    } else if (nextProps.action === 'login-likecoin') {
      if (this._likeCoinModal) this._likeCoinModal.show();
    }
  }

  _clearURLSearchParams() {
    const pushURL = new URL(window.location.href);
    pushURL.searchParams.delete('likecoinaction');
    pushURL.searchParams.delete('likecoinId');
    this.props.dispatch(push(window.location.pathname + pushURL.search));
  }

  _handleRegisterLikeCoinIdButtonClick = () => {
    window.location.assign(getLikeCoinRegistrationURL());
  }

  _handleLoginLikeCoinButtonClick = () => {
    const pushURL = new URL(window.location.href);
    pushURL.searchParams.append('likecoinaction', 'login-likecoin');
    this.props.dispatch(push(window.location.pathname + pushURL.search));
  }

  _handleLikeCoinConnect = ({ address, likeCoinId }) => {
    this._clearURLSearchParams();
    this.props.dispatch(Actions.connectLikeCoin({ address, likeCoinId }));
  }

  _handleLikeCoinCloseConnection = () => {
    this._clearURLSearchParams();
    if (this._likeCoinModal) this._likeCoinModal.hide();
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
    const { t, likeCoinId, userId } = this.props;

    console.log(this._handleLikeCoinConnect);

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

        <LikeCoinLoginModal
          ref={(ref) => { this._likeCoinModal = ref; }}
          t={t}
          signParams={{ userId }}
          onConnect={this._handleLikeCoinConnect}
          onClose={this._handleLikeCoinCloseConnection}
        />

      </ProfilePanel>
    );
  }
}
