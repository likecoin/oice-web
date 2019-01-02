import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import { showPaymentInProfile } from 'common/utils/auth';
import { PROFILE_ACTION } from 'web/pages/Profile/Profile.constants';

import PricingTable from 'web/components/PricingTable';
import Header from './Header';

import './Pricing.styles.scss';


@translate('PricingSection')
export default class PricingSection extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  _handleClickRegistrationButton = () => {
    window.location.pathname = '/edit';
  }

  _handleClickBecomeOiceBackerButton = () => {
    showPaymentInProfile.set();
    window.location.href = `/profile?action=${PROFILE_ACTION.BECOME_BACKER}`;
  }

  render() {
    const { t } = this.props;
    return (
      <section className="pricing-section">
        <div className="section-wrapper">
          <Header t={t} isGradient />
          <PricingTable
            onClickRegistrationButton={this._handleClickRegistrationButton}
            onClickBecomeOiceBackerButton={this._handleClickBecomeOiceBackerButton}
          />
        </div>
      </section>
    );
  }
}
