import request from 'superagent';

import { API_URL, API_HEADER } from '../constants';


export const fetchLinkTypes = () =>
request.get(`${API_URL}user/links/types`)
.withCredentials()
.set(API_HEADER)
.then(response => (
  response.ok ? response.body.linkTypes : null
));

export const fetchUserLinks = userId =>
request.get(`${API_URL}user/${userId}/links`)
.withCredentials()
.set(API_HEADER)
.then(response => (
  response.ok ? response.body.links : null
));

// link (Object of label, link and typeAlias(optional))
export const createUserLinks = link =>
request.post(`${API_URL}user/links`)
.withCredentials()
.set(API_HEADER)
.send(link)
.then(response => (
  response.ok ? response.body.link : null
));

export const updateUserLinks = (linkId, link) =>
request.post(`${API_URL}user/link/${linkId}`)
.withCredentials()
.set(API_HEADER)
.send(link)
.then(response => (
  response.ok ? response.body.link : null
));

export const deleteUserLinks = linkId =>
request.del(`${API_URL}user/link/${linkId}`)
.withCredentials()
.set(API_HEADER)
.then(response => (
  response.ok ? response.body.message : null
));
