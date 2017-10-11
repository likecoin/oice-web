import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';

export const fetchCharacter = storyId =>
request.get(`${API_URL}story/${storyId}/character`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.characters;
  }
  return [];
});

export const getCharacter = characterId =>
request.get(`${API_URL}character/${characterId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.character;
  }
  return [];
});

export const fetchByLibrary = libraryId =>
request.get(`${API_URL}library/${libraryId}/character`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.characters;
  }
  return [];
});

export const addCharacter = character =>
request.post(`${API_URL}library/${character.libraryId}/character`)
.withCredentials()
.send(character)
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.character;
  }
  return {};
});

export const updateCharacter = character =>
request.post(`${API_URL}character/${character.id}`)
.withCredentials()
.query({ language: 'zh-HK' })   // TODO: localize character
.send(character)
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.character;
  }
  return {};
});


export const deleteCharacter = characterId =>
request.del(`${API_URL}character/${characterId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.message;
  }
  return null;
});
