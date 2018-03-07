import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'boron/DropModal';

import classNames from 'classnames';

import Progress from 'ui-elements/Progress';
import RaisedButton from 'ui-elements/RaisedButton';

import LikeCoinManager from 'common/utils/LikeCoin';

import { SRV_ENV } from 'common/constants';

import './LikeCoinLoginModal.styles.scss';


function isDesktopChromeBrowser() {
  const { userAgent, vendor } = window.navigator;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent)) {
    return false;
  }
  return (/Chrome/i.test(userAgent) && /Google/i.test(vendor));
}


function LikeCoinModal({
  type,
  headerTitle,
  title,
  content,
  image,
  buttons,
  children,
}) {
  const rootClassName = classNames('likecoin-modal', type);

  return (
    <div className={rootClassName}>

      <header className={type}>
        {headerTitle || <div className="icon" />}
      </header>

      <div className="likecoin-modal-content">
        <h1>{title}</h1>
        <p>{content}</p>
        {children}
      </div>

      {(image || buttons) &&
        <footer className="likecoin-modal-footer">
          {!!image &&
            <img src={image} role="presentation" alt={title} />
          }
          {buttons &&
            <ul className="buttons">
              {buttons.map((child, index) => <li key={`btn-${index}`}>{child}</li>)}
            </ul>
          }
        </footer>
      }

    </div>
  );
}

LikeCoinModal.propTypes = {
  type: PropTypes.oneOf(['default', 'chrome', 'metamask']),
  headerTitle: PropTypes.string,
  title: PropTypes.string,
  content: PropTypes.string,
  image: PropTypes.string,
  buttons: PropTypes.arrayOf(PropTypes.node),
  children: PropTypes.node,
};

LikeCoinModal.defaultProps = {
  type: 'default',
};


export default class LikeCoinLoginModal extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    signParams: PropTypes.object,
    onConnect: PropTypes.func,
    onClose: PropTypes.func,
  }

  state = {
    error: undefined,
    isSigning: false,
  }

  componentWillUnmount() {
    this._onHide();
  }

  show = () => {
    this.setState({
      error: undefined,
      isSigning: false,
    });

    if (this._modal) this._modal.show();

    LikeCoinManager.init({
      isTestNet: SRV_ENV !== 'production',
      onConnect: this._handleLikeCoinManagerConnect,
      onError: this._handleLikeCoinManagerError,
    });
  }

  hide = () => {
    if (this._modal) this._modal.hide();
  }

  _onHide = () => {
    LikeCoinManager.removeAllListeners();
    const { onClose } = this.props;
    if (onClose) onClose();
  }

  _getChrome = () => {
    const newTab = window.open('https://www.google.com/chrome/', '_blank');
    newTab.focus();
  }

  _getMetaMask = () => {
    const newTab = window.open('https://metamask.io/', '_blank');
    newTab.focus();
  }

  _handleLikeCoinManagerError = (error) => {
    this.setState({ error });
  }

  _handleLikeCoinManagerConnect = async () => {
    const { signParams, onConnect } = this.props;

    this.setState({
      error: undefined,
      isSigning: true,
    });

    LikeCoinManager.removeAllListeners();
    const address = LikeCoinManager.getWalletAddress();
    const signature = await LikeCoinManager.signObject({ ...signParams, address });

    if (signature) {
      if (onConnect) onConnect({ address, signature });
      this.setState({ isSigning: false });
    } else {
      this.hide();
    }
  }

  _renderModalContent() {
    const {
      props: {
        t,
      },
      state: {
        isSigning,
      },
    } = this;

    if (!isDesktopChromeBrowser()) {
      return (
        <LikeCoinModal
          type="chrome"
          title={t('LikeCoinLoginModal.title.desktopChromeRequired')}
          content={t('LikeCoinLoginModal.label.desktopChromeRequired')}
          buttons={[
            <RaisedButton
              label={t('LikeCoinLoginModal.button.installChrome')}
              onClick={this._getChrome}
            />,
          ]}
        />
      );
    }

    if (isSigning) {
      return (
        <LikeCoinModal
          type="metamask"
          title={t('LikeCoinLoginModal.title.signMetaMask')}
          content={t('LikeCoinLoginModal.label.signMetaMask')}
        />
      );
    }

    const { error } = this.state;
    if (error) {
      switch (error.message) {
        case 'ERR_WEB3_NOT_AVAILABLE':
          return (
            <LikeCoinModal
              type="metamask"
              title={t('LikeCoinLoginModal.title.metaMaskRequired')}
              content={t('LikeCoinLoginModal.label.metaMaskRequired')}
              buttons={[
                <RaisedButton
                  color="#ED8526"
                  label={t('LikeCoinLoginModal.button.installMetaMask')}
                  onClick={this._getMetaMask}
                />,
                <RaisedButton
                  color="#28646E"
                  label={t('LikeCoinLoginModal.button.installedMetaMask')}
                  onClick={() => window.location.reload()}
                />,
              ]}
            />
          );

        case 'ERR_NETWORK_NOT_IN_RINKEBY':
          return (
            <LikeCoinModal
              type="metamask"
              title={t('LikeCoinLoginModal.title.switchToRinkeby')}
              content={t('LikeCoinLoginModal.label.switchToRinkeby')}
              image="/static/img/likecoin/metamask_rinkeby-net.png"
            />
          );

        case 'ERR_NETWORK_NOT_IN_MAIN':
          return (
            <LikeCoinModal
              type="metamask"
              title={t('LikeCoinLoginModal.title.switchToMainNet')}
              content={t('LikeCoinLoginModal.label.switchToMainNet')}
              image="/static/img/likecoin/metamask_main-net.png"
            />
          );

        case 'ERR_ACCOUNTS_LOCKED':
          return (
            <LikeCoinModal
              type="metamask"
              title={t('LikeCoinLoginModal.title.unlockMetaMask')}
              content={t('LikeCoinLoginModal.label.unlockMetaMask')}
              image="/static/img/likecoin/metamask_unlock.png"
            />
          );

        default:
      }
    }

    return (
      <LikeCoinModal headerTitle={t('LikeCoinLoginModal.title.connectWithLikeCoin')}>
        <Progress.LoadingIndicator />
      </LikeCoinModal>
    );
  }

  render() {
    return (
      <Modal
        ref={(ref) => { this._modal = ref; }}
        className="likecoin-login-modal"
        closeOnClick={!!this.state.error || this.state.isSigning}
        modalStyle={{ borderRadius: 6, maxWidth: '100%', width: 360 }}
        onHide={this._onHide}
      >
        {this._renderModalContent()}
      </Modal>
    );
  }
}
