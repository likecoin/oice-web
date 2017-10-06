import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Modal from 'ui-elements/ModalTwo';

import './LoginModal.scss';

function LoginModal(props) {
  const { t, open } = props;
  return (
    <Modal
      open={open}
      width={356}
      onClickOutside={props.onClickCloseButton}
    >
      <Modal.Header onClickCloseButton={props.onClickCloseButton}>
        {t('header')}
      </Modal.Header>
      <Modal.Body>
        <span>{t('label.mustLoginToAccess')}</span>
        <div className="login-button">
          <a href="/login">
            <img alt="Google btn" src="/img/logo_google.png" />
            <p>{t('useGoogleAccountLogin')}</p>
          </a>
        </div>
      </Modal.Body>
    </Modal>
  );
}

LoginModal.propTypes = {
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClickCloseButton: PropTypes.func,
};

LoginModal.defaultProps = {
  open: false,
};

export default translate(['LoginModal', 'introduction'])(LoginModal);
