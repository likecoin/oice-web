import firebase from '@firebase/app';

// Load individual services into the firebase namespace.
import '@firebase/auth';
import '@firebase/database';

import { IS_DEV_MODE } from 'common/constants';

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DB_URL,
  FIREBASE_PROJ_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_SENDER_ID,
} from '../constants/key';


export function init() {
  const config = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    databaseURL: FIREBASE_DB_URL,
    projectId: FIREBASE_PROJ_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_SENDER_ID,
  };
  if (!IS_DEV_MODE) {
    firebase.initializeApp(config);
  }
}

export default firebase;
