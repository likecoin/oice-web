import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import PricingTable from 'web/components/PricingTable';
import Header from './Header';

import './Pricing.styles.scss';


@translate('PricingSection')
export default class PricingSection extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  render() {
    const { t } = this.props;
    return (
      <section className="pricing-section">
        <div className="section-wrapper">
          <Header t={t} isGradient />
          <PricingTable />
        </div>
      </section>
    );
  }
}
