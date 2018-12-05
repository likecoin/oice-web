import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import StripeCheckout from 'react-stripe-checkout';
import OutlineButton from 'ui-elements/OutlineButton';
import { STRIPE_KEY } from 'common/constants/stripe';

import * as Actions from '../Profile.actions';


@connect()
@translate('checkout')
export default class OiceCheckout extends React.Component {
  static propTypes = {
    // apiKey: PropTypes.string,
    email: PropTypes.string.isRequired,
    buttonLabel: PropTypes.string,
    name: PropTypes.string,
    payLabel: PropTypes.string,
    description: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      token: null,
    };
  }

  onToken = (token) => {
    this.setState({ token });
  }

  onClose = () => {
    const { token } = this.state;
    if (token) {
      this.props.dispatch(Actions.updateMembership(token));
      this.props.dispatch(Actions.startLoading(true));
      // this will unmount the stripe, replace with the loading spinner;so need to call this function in onClose
    }
  }

  render() {
    const { t } = this.props;
    return (
      <StripeCheckout
        token={this.onToken}
        closed={this.onClose}
        stripeKey={STRIPE_KEY}
        email={this.props.email}
        panelLabel={this.props.payLabel || t('button.pay')}
        name={this.props.name || t('label.upgrade')}
        description={this.props.description || ''}
        allowRememberMe={false}
        amount={500} // XXX: Hardcode 500 => 5.00
        currency="USD"
      >
        <OutlineButton
          color="blue"
          label={this.props.buttonLabel}
        />
      </StripeCheckout>
    );
  }
}
