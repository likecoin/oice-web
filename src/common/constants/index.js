import _get from 'lodash/get';
import platform from 'platform';
import {
  DOMAIN_URL_PROD,
  DOMAIN_URL_K8S,
  DOMAIN_URL_LOCAL,
  ANDROID_PACKAGE_PROD,
  ANDROID_PACKAGE_TEST,
  ANDROID_NAME_PROD,
  ANDROID_NAME_TEST,
  FIREBASE_API_KEY,
  IOS_STORE_ID,
  IOS_NAME,
  LIKECOIN_URL_TEST,
  LIKECOIN_URL_PROD,
  OICE_VIEW_URL_BASE_TEST,
  OICE_VIEW_URL_BASE_PROD,
  LIKECOIN_BUTTON_URL_TEST,
  LIKECOIN_BUTTON_URL_PROD,
} from './key';

import packageJSON from '../../../package.json';

export const VERSION = packageJSON.version;

export const { SRV_ENV, IS_CLIENT } = process.env;

const get_domain_URL = () => {
  switch (SRV_ENV) {
    case 'production':
      return DOMAIN_URL_PROD;
    case 'kubernetes':
      return DOMAIN_URL_K8S;
    default:
    case 'localhost':
      return DOMAIN_URL_LOCAL;
  }
};

export const DOMAIN_URL = get_domain_URL();
export const API_URL = `${IS_CLIENT ? '' : DOMAIN_URL}/api/`;
export const API_HEADER = {
  Accept: 'application/json',
  'x-oice-platform': _get(platform, 'os.family'),
  'x-oice-platform-version': _get(platform, 'os.version'),
  'x-oice-browser': platform.name,
  'x-oice-browser-version': platform.version,
};

export const ANDROID_APP = {
  PACKAGE: SRV_ENV === 'production' ? ANDROID_PACKAGE_PROD : ANDROID_PACKAGE_TEST,
  NAME: SRV_ENV === 'production' ? ANDROID_NAME_PROD : ANDROID_NAME_TEST,
};

export const IOS_APP = {
  STORE_ID: IOS_STORE_ID,
  NAME: IOS_NAME,
};

export const IS_DEV_MODE = !FIREBASE_API_KEY;

export const LIKECOIN_URL = SRV_ENV === 'production' ? LIKECOIN_URL_PROD : LIKECOIN_URL_TEST;

export const LIKECOIN_BUTTON_URL = SRV_ENV === 'production' ? LIKECOIN_BUTTON_URL_PROD : LIKECOIN_BUTTON_URL_TEST;

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_APP.PACKAGE}`;

export const OICE_VIEW_URL_BASE = SRV_ENV === 'production' ? OICE_VIEW_URL_BASE_PROD : OICE_VIEW_URL_BASE_TEST;
