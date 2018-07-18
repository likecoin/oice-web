/* global branch: true */

import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { replace, push } from 'react-router-redux';

import OutlineButton from 'ui-elements/OutlineButton';
import LoadingIndicator from './LoadingIndicator';

import { actions as Actions } from './index';

import './LikeCoinTx.scss';


function validateTx(props) {
  const {
    dispatch, user, location, params,
  } = props;

  if (!user.isLoggingIn) {
    const { txhash } = location.query;
    const { id } = params;

    if (txhash && id && user.isLoggedIn) {
      dispatch(Actions.validateLikeCoinTx({ id, txhash }));
    } else {
      dispatch(replace('/about'));
    }
  }
}

@translate(['error', 'LikeCoinTx'])
@connect(store => ({
  ...store.LikeCoinTx,
  user: store.user,
}))
export default class LikeCoinTx extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    error: PropTypes.string,
    product: PropTypes.object,
  }

  componentDidMount() {
    validateTx(this.props);
  }

  componentWillReceiveProps(nextProps) {
    validateTx(nextProps);
  }

  renderProcessingTx() {
    const { t, error } = this.props;
    return (
      <div className="likecoin-tx__processing">
        {error ?
          <h2 className="error">{t(error)}; {t('label.contactCS')}</h2> :
          <h2>{t('label.processing')}</h2>
        }
        {!error && <LoadingIndicator />}
      </div>
    );
  }

  renderTxDetails() {
    const { product, t } = this.props;
    return (
      <div>
        <h1>{t('label.purchasedLibrary')}</h1>
        <div className="likecoin-tx__details">
          <img alt="cover" src={product.cover} />
          <h2>{product.name}</h2>
        </div>
      </div>
    );
  }

  render() {
    const { product, t } = this.props;
    return (
      <div className="likecoin-tx__wrapper">
        <div className="likecoin-tx__result">
          {!product ?
            this.renderProcessingTx() :
            this.renderTxDetails()
          }
        </div>

        {!!product &&
          <a className="likecoin-tx__back-button" href="/store">
            <OutlineButton
              color="gradient-likecoin"
              label={t('button.backLibrary')}
            />
          </a>
        }
      </div>
    );
  }
}
