import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';

export const fetchMacros = () =>
request.get(`${API_URL}macro`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.macros;
  }
  return null;
});


export const addMacro = (serializedMacro, storyId) =>
request.post(`${API_URL}project/${storyId}/macro`)
.withCredentials()
.set(API_HEADER)
.send(serializedMacro)
.then((response) => {
  if (response.ok) {
    return response.body.macro;
  }
  return null;
});

export const fetchMacroAttributesDef = macroID =>
request.get(`${API_URL}macro/${macroID}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.macro.attributes;
  }
  return null;
});

export const updateMacro = (serializedMacro, macroID) =>
request.post(`${API_URL}macro/${macroID}`)
.withCredentials()
.set(API_HEADER)
.send(serializedMacro)
.then((response) => {
  if (response.ok) {
    return response.body.macro;
  }
  return null;
});
