import {
    SRV_ENV,
    STRIPE_KEY_PROD,
    STRIPE_KEY_TEST,
    STRIPE_CLIENT_ID_PROD,
    STRIPE_CLIENT_ID_TEST,
} from './key';

export const STRIPE_KEY = (
  SRV_ENV === 'production' ?
  STRIPE_KEY_PROD :
  STRIPE_KEY_TEST
);

export const STRIPE_CLIENT_ID = (
  SRV_ENV === 'production' ?
  STRIPE_CLIENT_ID_PROD :
  STRIPE_CLIENT_ID_TEST
);
