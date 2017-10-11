import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Modal from 'ui-elements/ModalTwo';

import { DOMAIN_URL } from 'common/constants';
import { STRIPE_ACTION } from 'web/pages/Stripe/constants';

import './ConnectStripeModal.scss';

function ConnectStripeModal(props) {
  const { t, open } = props;
  const action = STRIPE_ACTION.CONNECT;
  const url = `stripe?action=${action}&redirect=asset?action=add-sale-library`;
  return (
    <div id="connect-stripe-modal">
      <Modal
        open={open}
        width={356}
        onClickOutside={props.onClickCloseButton}
      >
        <Modal.Header onClickCloseButton={props.onClickCloseButton}>
          {t('label.header')}
        </Modal.Header>
        <Modal.Body>
          <span>{t('label.mustConnectStripeToSellLibrary')}</span>
          <div className="stripe-connect-wrapper">
            <a className="stripe-connect light-blue" href={`/${url}`}>
              <span>Connect with Stripe</span>
            </a>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

ConnectStripeModal.propTypes = {
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClickCloseButton: PropTypes.func,
};

ConnectStripeModal.defaultProps = {
  open: false,
};

export default translate(['ConnectStripeModal'])(ConnectStripeModal);
