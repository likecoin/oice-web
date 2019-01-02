import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { translate } from 'react-i18next';
import { findDOMNode } from 'react-dom';

import _get from 'lodash/get';

import PricingTable from 'web/components/PricingTable';

import { isNormalUser } from 'common/utils/user';
import * as IntercomUtils from 'common/utils/intercom';

import OiceCheckout from '../AccountSettingTab/OiceCheckout';

import { PROFILE_ACTION } from '../Profile.constants';

import './MembershipTab.styles.scss';


@connect(store => ({
  user: store.Profile.userProfile,
  loading: store.Profile.loading,
  saving: store.Profile.saving,
}))
@translate(['general', 'Profile', 'Language'])
export default class MembershipTab extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    action: PropTypes.string,
    referrer: PropTypes.string,
  }

  static defaultProps = {
    action: undefined,
  }

  componentDidMount() {
    const isBacker = !isNormalUser(this.props.user.role);

    if (!isBacker && this.props.action === PROFILE_ACTION.SUBSCRIBE && this.paymentButton) {
      findDOMNode(this.paymentButton).click();
      IntercomUtils.update({ oice_subscriptionReferrerID: this.props.referrer });
      this.props.dispatch(replace('/profile'));
    }
  }

  renderCheckOutButton() {
    const { t, user } = this.props;
    const isBacker = !isNormalUser(user.role);
    return (
      <OiceCheckout
        ref={ref => this.paymentButton = (!isBacker ? ref : null)}
        buttonLabel={isBacker ? t('accountSetting.button.continueSubscription') : t('accountSetting.button.upgrade')}
        email={user.email}
      />
    );
  }

  render() {
    const { t } = this.props;

    return (
      <div className="membership-tab">
        <div>
          <h1 dangerouslySetInnerHTML={{ __html: t('PricingSection:title') }} />
          <PricingTable
            oiceBackerButton={this.renderCheckOutButton()}
          />
        </div>
      </div>
    );
  }
}
