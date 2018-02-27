import Web3 from 'web3';


const RETRY_TIMEOUT = 3000; // In ms
const ACCOUNT_POLLING_INTERVAL = 3000; // In ms


class LikeCoinManager {
  accounts = []

  init({
    isTestNet = true,
    onConnect,
    onError,
  }) {
    this.isTestNet = isTestNet;
    this._connectionListener = onConnect;
    this._errorListener = onError;
    this.pollForWeb3();
  }

  addConnectionListener(listener) {
    this._connectionListener = listener;
  }

  removeConnectionListener() {
    if (this._connectionListener) {
      clearTimeout(this._connectionListener);
      this._connectionListener = null;
    }
  }

  onConnect() {
    if (this._connectionListener) {
      this._connectionListener();
    }
  }

  onError(error) {
    if (this._errorListener) {
      this._errorListener(error);
    }
  }

  destory() {
    if (this.web3PollingTimer) {
      clearTimeout(this.web3PollingTimer);
      this.web3PollingTimer = null;
    }

    this.removeConnectionListener();
  }

  getWalletAddress() {
    return this._walletAddress;
  }

  async pollForWeb3() {
    try {
      if (typeof window.web3 !== 'undefined') {
        if (this.web3PollingTimer) {
          clearTimeout(this.web3PollingTimer);
          this.web3PollingTimer = null;
        }

        if (!this.web3) {
          this.web3 = new Web3(window.web3.currentProvider);
        }

        const currentNetwork = await this.web3.eth.net.getNetworkType();
        const targetNetwork = (this.isTestNet ? 'rinkeby' : 'main');
        if (currentNetwork === targetNetwork) {
          this.start();
          this.isMetaMask = true;
        } else if (this.isTestNet) {
          throw new Error('ERR_NETWORK_NOT_IN_RINKEBY');
        } else {
          throw new Error('ERR_NETWORK_NOT_IN_MAIN');
        }
      } else {
        throw new Error('ERR_WEB3_NOT_AVAILABLE');
      }
    } catch (error) {
      this.onError(error);
      this.web3PollingTimer = setTimeout(() => this.pollForWeb3(), RETRY_TIMEOUT);
    }
  }

  start() {
    this.pollForAccounts();
  }

  pollForAccounts() {
    this.getAccounts();
    this.accountPollingTimer = setInterval(() => this.getAccounts(), ACCOUNT_POLLING_INTERVAL);
  }

  getAccounts() {
    this.web3.eth.getAccounts().then((accounts) => {
      if (accounts && accounts[0]) {
        if (this.wallet !== accounts[0]) {
          this.accounts = accounts;
          [this._walletAddress] = accounts;
          this.onConnect();
        }
      } else if (this.isMetaMask) {
        this.wallet = '';
        this.onError(new Error('ERR_ACCOUNTS_LOCKED'));
      }
    });
  }

  sendAsync(obj) {
    return new Promise((resolve, reject) => {
      this.web3.currentProvider.sendAsync(obj, (err, result) => {
        if (err) {
          reject(err);
        } else if (result.error) {
          reject(result.error);
        } else {
          resolve(result.result || result);
        }
      });
    });
  }

  async signTypedData(signData, from) {
    try {
      const result = await this.sendAsync({
        method: 'eth_signTypedData',
        params: [signData, from],
        from,
      });
      return result;
    } catch (err) {
      console.error(err);
    }
    return '';
  }

  static createTypedSignPayload(payload) {
    return [
      { type: 'string', name: 'payload', value: payload },
    ];
  }

  signObject(payload) {
    const typedSignData = LikeCoinManager.createTypedSignPayload(JSON.stringify(payload));
    return this.signTypedData(typedSignData, this._walletAddress);
  }
}

export default new LikeCoinManager();
