import request from 'superagent';

import i18next, { mapLanguageCode } from '../utils/i18n';
import { API_URL, API_HEADER } from '../constants';


export const loginWithGoogle = (firebaseUser, firebaseToken, googleToken) => {
  const { displayName, photoURL, providerId } = firebaseUser.providerData[0];
  const payload = {
    isAnonymous: false,
    email: firebaseUser.email,
    firebaseUserId: firebaseUser.uid,
    language: mapLanguageCode(i18next.language),
    firebaseToken,
    googleToken,
    displayName,
    photoURL,
  };
  return request
    .post(`${API_URL}login`)
    .set(API_HEADER)
    .send(payload)
    .then(response => (
      response.ok ? response.body.user : null
    ));
};

export const signOut = () =>
  request
    .del(`${API_URL}logout`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => null);

export const postMembership = token =>
  request
    .post(`${API_URL}membership`)
    .withCredentials()
    .set(API_HEADER)
    .send(JSON.stringify(token))
    .then(response => (
      response.ok ? response.body : null
    ));

export const cancelSubscription = token =>
  request
    .del(`${API_URL}membership`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => (
      response.ok ? response.body : null
    ));

export const getUserProfile = ({ cookie }) => {
  const req = request
    .get(`${API_URL}profile`)
    .withCredentials()
    .set(API_HEADER);

  if (cookie) req.set('Cookie', cookie);

  return req.then(response => (
    response.ok ? response.body.user : {}
  ));
};

export const profileUsernameCheck = username =>
  request
    .post(`${API_URL}profile/username/check`)
    .withCredentials()
    .set(API_HEADER)
    .send({ username })
    .then(response => (
      response.ok ? response.body.message : null
    ));


export const updateUser = (user) => {
  let post = request
    .post(`${API_URL}profile`)
    .withCredentials()
    .set(API_HEADER);
  if (user.meta) post = post.field('meta', user.meta);
  if (user.avatar) {
    post = post.attach('avatar', user.avatar);
    post = post.on('progress', (e) => {
      console.log('upload image progress', e);
    });
  }
  return post.then(response => (
    response.ok ? response.body.user : null
  ));
};

export const search = prefix =>
  request
    .get(`${API_URL}user/search/${prefix}`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => (
      response.ok ? response.body.users : []
    ));

export const fetchUserProfile = id =>
  request
    .get(`${API_URL}user/${id}/profile`)
    .set(API_HEADER)
    .then(response => response.body.user);

export const fetchUserProfileDetails = id =>
  request
    .get(`${API_URL}user/${id}/profile/details`)
    .set(API_HEADER)
    .then(response => response.body.profile);

export const connectStripe = code =>
  request
    .post(`${API_URL}membership/connect`)
    .withCredentials()
    .set(API_HEADER)
    .send(JSON.stringify(code))
    .then(response => (
      response.ok ? response.body.message : null
    ));

export const disconnectStripe = code =>
  request
    .del(`${API_URL}membership/connect`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => (
      response.ok ? response.body.message : null
    ));
