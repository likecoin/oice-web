import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'boron/DropModal';

import classNames from 'classnames';

import OutlineButton from 'ui-elements/OutlineButton';
import Progress from 'ui-elements/Progress';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';

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
    onConnect: PropTypes.func,
    onClose: PropTypes.func,
  }

  state = {
    error: undefined,
    isConnected: false,
    likeCoinId: '',
  }

  componentWillUnmount() {
    this._onHide();
  }

  show = () => {
    this.setState({
      error: undefined,
      isConnected: false,
    });

    if (this._modal) this._modal.show();

    LikeCoinManager.init({
      isTestNet: null,
      onConnect: this._handleLikeCoinManagerWalletConnect,
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

  _handleLikeCoinManagerWalletConnect = () => {
    this.setState({
      error: undefined,
      isConnected: true,
    });
  }

  _handleOnConfirmConnect = () => {
    LikeCoinManager.removeAllListeners();
    const address = LikeCoinManager.getWalletAddress();
    const { likeCoinId } = this.state;
    const { onConnect } = this.props;

    if (address && likeCoinId) {
      if (onConnect) {
        onConnect({
          address,
          likeCoinId: likeCoinId.trim(),
        });
      }
      this.setState({
        isConnected: false,
        likeCoinId: '',
      });
    } else {
      this.hide();
    }
  }

  _renderModalContent() {
    const {
      props: {
        t,
        onConnect,
      },
      state: {
        error,
        isConnected,
        likeCoinId,
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

    if (isConnected) {
      return (
        <LikeCoinModal
          type="metamask"
          title={t('LikeCoinLoginModal.title.enterLikeCoinId')}
          buttons={[
            <OutlineButton
              color="green"
              label={t('confirm')}
              onClick={this._handleOnConfirmConnect}
            />,
          ]}
        >
          <TextField
            value={likeCoinId}
            fullWidth
            onChange={value => this.setState({ likeCoinId: value })}
          />
        </LikeCoinModal>
      );
    }

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
        closeOnClick={!!this.state.error || this.state.isConnected}
        modalStyle={{ borderRadius: 6, maxWidth: '100%', width: 360 }}
        onHide={this._onHide}
      >
        {this._renderModalContent()}
      </Modal>
    );
  }
}
