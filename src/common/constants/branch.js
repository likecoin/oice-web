import { SRV_ENV } from '../constants';
import {
  BRANCH_KEY_PROD,
  BRANCH_KEY_TEST,
  BRANCH_URL_PROD,
  BRANCH_URL_TEST,
} from './key';

export const BRANCH_KEY = (
  SRV_ENV === 'production' ?
  BRANCH_KEY_PROD :
  BRANCH_KEY_TEST
);

export const BRANCH_URL = (
  SRV_ENV === 'production' ?
  BRANCH_URL_PROD :
  BRANCH_URL_TEST
);
