import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { findDOMNode } from 'react-dom';

import classNames from 'classnames';
import moment from 'moment';

import _get from 'lodash/get';

import CircularLoader from 'ui-elements/CircularLoader';
import Dropdown from 'ui-elements/Dropdown';
import OutlineButton from 'ui-elements/OutlineButton';
import SubNavBar from 'ui-elements/SubNavBar';

import I18nIcon from 'common/icons/i18n';

import i18next, {
  mapUILanguageCode,
  isStoryLanguageSupported,
} from 'common/utils/i18n';

import LANGUAGE_LIST, { SUPPORTED_STORY_LANGUAGES } from 'common/constants/i18n';
import USER_ROLE from 'common/constants/userRoles';
import { LIBRARY_ACTION } from 'asset-library/constants';

import { showPaymentInProfile } from 'common/utils/auth';
import { isNormalUser } from 'common/utils/user';

import OiceCheckout from './OiceCheckout';
import LikeCoinIntegrationPanel from './LikeCoinIntegrationPanel';
import ProfilePanel from '../ProfilePanel';

import { PROFILE_ACTION } from '../Profile.constants';
import * as Actions from '../Profile.actions';


@connect(store => ({
  user: store.Profile.userProfile,
  loading: store.Profile.loading,
  saving: store.Profile.saving,
}))
@translate(['general', 'Profile', 'Language'])
export default class AccountSettingTab extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    saving: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    action: PropTypes.string,
  }

  static defaultProps = {
    action: undefined,
  }

  constructor(props) {
    super(props);

    this.state = {
      language: _get(props, 'user.language'),
      uiLanguage: _get(props, 'user.uiLanguage'),
    };
  }

  componentDidMount() {
    if (showPaymentInProfile.get() && this.paymentButton) {
      findDOMNode(this.paymentButton).click();
      showPaymentInProfile.clear();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { user, action } = nextProps;

    // Reload the page after saving switch of language option
    const previousLanguage = _get(this.props, 'user.uiLanguage');
    if (previousLanguage && previousLanguage !== user.uiLanguage) {
      i18next.changeLanguage(user.uiLanguage, () => {
        window.location.reload();
      });
    }

    const previousRole = _get(this.props, 'user.role');
    if (action === PROFILE_ACTION.MEMBERSHIP && previousRole && previousRole !== user.role) {
      window.location.href = `/asset?action=${LIBRARY_ACTION.ADD_PRIVATE_LIBRARY}`;
    }
  }

  handleRequestCancelSubscription = () => {
    this.props.dispatch(Actions.cancelSubscription());
    this.props.dispatch(Actions.startLoading(true));
  }

  handleUpdateUser = (payload) => {
    this.setState(payload);
  }

  handleSaveLangugeSetting = () => {
    const updatedObject = {};
    const { language, uiLanguage } = this.state;
    if (this.hasUpdated({ language })) updatedObject.language = language;
    if (this.hasUpdated({ uiLanguage })) updatedObject.uiLanguage = uiLanguage;
    this.props.dispatch(Actions.updateUser(updatedObject));
  }

  hasUpdated(payload) {
    const keys = Object.keys(payload);
    return keys.some(key => _get(this.props, `user.${key}`) !== _get(this.state, key));
  }

  renderAccountInfoPanel(user) {
    const { t, loading } = this.props;
    const { expireDate, isCancelled, isTrial } = user;
    const isBacker = !isNormalUser(user.role);
    const memberStatus = t(`accountSetting.label.${
      isBacker ? 'backer' : 'member'
    }`);

    let actionButton;
    if (loading) {
      actionButton = (
        <CircularLoader
          color={isBacker ? 'white' : 'blue'}
          size={28}
        />
      );
    } else if (isBacker && !isCancelled && !isTrial) {
      actionButton = (
        <OutlineButton
          color="blue"
          label={t('accountSetting.button.cancelSubscription')}
          onClick={this.handleRequestCancelSubscription}
        />
      );
    } else {
      actionButton = (
        <OiceCheckout
          ref={ref => this.paymentButton = (!isBacker ? ref : null)}
          buttonLabel={isBacker ? t('accountSetting.button.continueSubscription') : t('accountSetting.button.upgrade')}
          email={user.email}
        />
      );
    }

    return (
      <ProfilePanel
        header={t('accountSetting.header.accountInformation')}
      >
        <span className="account-email">
          <span>{t('accountSetting.label.account')}</span>
          <span>{user.email}</span>
        </span>
        <div
          className={classNames('call-to-action-banner', {
            backer: isBacker,
          })}
        >
          <div className="member-status">
            oice <span>{memberStatus}</span>
            <p className="description">
              {isBacker ? (user.expireDate &&
                t('accountSetting.label.expireOn', {
                  date: moment(user.expireDate).format('YYYY-MM-DD'),
                })
              ) : t('accountSetting.label.upgradeToSupport')}
            </p>
          </div>
          {actionButton}
        </div>
      </ProfilePanel>
    );
  }

  renderLanguageSettingPanel(user) {
    const { t, saving } = this.props;
    const { language } = this.state;
    // map uiLanguage for `zh`
    const uiLanguage = mapUILanguageCode(this.state.uiLanguage);

    const isSupportedStoryLanguage = isStoryLanguageSupported(language);
    const supportedStoryLanguages = (
      isSupportedStoryLanguage ?
        SUPPORTED_STORY_LANGUAGES :
        [...SUPPORTED_STORY_LANGUAGES, 'others']
    );

    return (
      <ProfilePanel
        disableSaveButton={!this.hasUpdated({ language, uiLanguage }) || saving}
        header={t('accountSetting.header.languageSetting')}
        onClickSave={this.handleSaveLangugeSetting}
      >
        <div className="user-language-setting">
          <div>
            <span>{t('accountSetting.label.UILanguage')}</span>
            <div className="language-dropdown">
              <Dropdown.Legacy
                leftIcon={<I18nIcon />}
                options={LANGUAGE_LIST}
                value={uiLanguage}
                onChange={lang => this.handleUpdateUser({ uiLanguage: lang })}
              />
            </div>
          </div>
          <div>
            <span>{t('accountSetting.label.defaultStoryLanguage')}</span>
            <div className="language-dropdown">
              <Dropdown.Legacy
                leftIcon={<I18nIcon />}
                options={supportedStoryLanguages.map(lang => ({
                  text: t(lang),
                  value: lang,
                }))}
                value={isSupportedStoryLanguage ? language : 'others'}
                onChange={lang => this.handleUpdateUser({ language: lang })}
              />
            </div>
          </div>
        </div>
      </ProfilePanel>
    );
  }

  renderReceivePaymentSetting(user) {
    const { t } = this.props;
    const description = (
      <p>{t(`accountSetting.label.${user.isStripeConnected ? 'stripeConnected' : 'stripeConnectDescription'}`)}</p>
    );
    const actionLink = (
      <a
        className="stripe-connect light-blue"
        href={`/stripe?action=${user.isStripeConnected ? 'disconnect' : 'connect'}&redirect=profile`}
      >
        <span>{user.isStripeConnected ? t('accountSetting.button.disconnectStripe') : 'Connect with Stripe'}</span>
      </a>
    );

    return (
      <ProfilePanel
        header={t('accountSetting.header.receivePaymentSetting')}
      >
        <div className="stripe-connect-wrapper">
          {description}
          {actionLink}
        </div>
      </ProfilePanel>
    );
  }

  render() {
    const { t, user } = this.props;

    return (
      <div id="account-setting-container">
        {this.renderAccountInfoPanel(user)}
        <LikeCoinIntegrationPanel />
        {this.renderLanguageSettingPanel(user)}
        {this.renderReceivePaymentSetting(user)}
      </div>
    );
  }
}
