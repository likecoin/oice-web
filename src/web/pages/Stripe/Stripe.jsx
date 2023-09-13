import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import AlertDialog from 'ui-elements/AlertDialog';
import LoadingScreen from 'ui-elements/LoadingScreen';

import * as UserAction from 'common/actions/user';

import Utils from 'common/utils';

import {
  getAuthItem,
  redirectToLoginPage,
} from 'common/utils/auth';

import { DOMAIN_URL } from 'common/constants';

import * as Actions from './Stripe.actions';
import { STRIPE_ACTION } from './constants';

@connect(store => ({ ...store.user }))
export default class Stripe extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    isLoggedIn: PropTypes.bool,
  }

  componentDidMount() {
    const { isLoggedIn, location } = this.props;

    if (isLoggedIn) {
      const queryParams = location.query;

      if (!queryParams.redirect) {
        [queryParams.action, queryParams.redirect] = queryParams.action.split('__');
      }

      switch (queryParams.action) {
        case STRIPE_ACTION.CONNECT:
          this.handleRequestConnectStripe(queryParams);
          break;
        case STRIPE_ACTION.DASHBOARD:
          this.handleGoToStripeConnectDashboard(queryParams);
          break;
        default:
          break;
      }
    }
  }

  handleRequestConnectStripe = () => {
    this.props.dispatch(Actions.connectStripeConnect());
  }

  handleGoToStripeConnectDashboard = () => {
    this.props.dispatch(Actions.goToStripeConnectDashboard());
  }

  render() {
    return (
      <div id="stripe" />
    );
  }
}
