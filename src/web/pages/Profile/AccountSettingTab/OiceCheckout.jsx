import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import OutlineButton from 'ui-elements/OutlineButton';

import * as Actions from '../Profile.actions';


@connect()
@translate('checkout')
export default class OiceCheckout extends React.Component {
  static propTypes = {
    buttonLabel: PropTypes.string,
    disabled: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  }

  onClick = async () => {
    this.props.dispatch(Actions.startLoading(true));
    const { url } = await this.props.dispatch(Actions.purchaseMembership());
    if (url) {
      window.location.href = url;
    } else {
      this.props.dispatch(Actions.startLoading(false));
    }
  }

  render() {
    return (
      <OutlineButton
        color="blue"
        label={this.props.buttonLabel}
        disabled={this.props.disabled}
        onClick={this.onClick}
      />
    );
  }
}
