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
    IOS_STORE_ID,
    IOS_NAME,
    INTERCOM_APP_ID_PROD,
    INTERCOM_APP_ID_TEST,
} from '../constants/key';

export const VERSION = '4.1.1';

export const SRV_ENV = process.env.SRV_ENV;
export const IS_CLIENT = process.env.IS_CLIENT;

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

export const INTERCOM_APP_ID = SRV_ENV === 'production' ? INTERCOM_APP_ID_PROD : INTERCOM_APP_ID_TEST;

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_APP.PACKAGE}`;

