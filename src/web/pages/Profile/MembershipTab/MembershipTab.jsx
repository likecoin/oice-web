import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { translate } from 'react-i18next';
import { findDOMNode } from 'react-dom';

import _get from 'lodash/get';

import PricingTable from 'web/components/PricingTable';

import { isNormalUser } from 'common/utils/user';
import * as CrispUtils from 'common/utils/crisp';

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
    loading: PropTypes.bool,
  }

  static defaultProps = {
    action: undefined,
  }

  componentDidMount() {
    const isBacker = !isNormalUser(this.props.user.role);

    if (!isBacker && this.props.action === PROFILE_ACTION.SUBSCRIBE && this.paymentButton) {
      findDOMNode(this.paymentButton).click();
      CrispUtils.update('oice_subscriptionReferrerID', this.props.referrer);
      this.props.dispatch(replace('/profile'));
    }
  }

  renderCheckOutButton() {
    const { t, user, loading } = this.props;
    const isBacker = !isNormalUser(user.role);
    return !isBacker && (
      <OiceCheckout
        ref={(ref) => { this.paymentButton = ref; }}
        buttonLabel={t(loading ? 'loadingScreen:label.loading' : 'accountSetting.button.upgrade')}
        email={user.email}
        disabled={loading}
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
