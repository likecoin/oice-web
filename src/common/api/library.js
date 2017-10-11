import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';
import Converter from './converter';

export const fetchLibraries = () =>
request.get(`${API_URL}library`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body;
  }
  return [];
});

export const fetchLibrary = libraryId =>
request.get(`${API_URL}library/${libraryId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.library;
  }
  return null;
});

export const fetchLibraryOG = libraryId =>
request.get(`${API_URL}library/${libraryId}/og`)
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.library;
  }
  return null;
});

export const fetchLibrariesByStory = (storyId) =>
request.get(`${API_URL}/story/${storyId}/library`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body;
  }
  return [];
});

const addORupdateLibrary = (library, url) => {
  const {
    name,
    description,
    isPublic,
    license,
    coverImage,
    type,
    price,
    isPriceUpdated,
    isLaunched,
    launchedAt,
  } = library;

  let post = request.post(`${url}`).withCredentials();

  const meta = {};
  if (name.length === 0) return Promise.reject('Library name empty!');

  meta.name = name;
  meta.description = description;
  meta.isPublic = isPublic;
  meta.license = license;
  meta.type = type;
  meta.launchedAt = launchedAt;
  if (isPriceUpdated) {
    meta.price = price;
  }
  if (isLaunched !== null || isLaunched !== undefined) {
    meta.isLaunched = isLaunched;
  }

  post = post.field('meta', JSON.stringify(meta));

  if (coverImage) {
    post = post.attach('coverStorage', coverImage);
    post = post.on('progress', e => {
      console.log('upload coverStorage progress', e);
    });
  }

  return post.then((response) => {
    if (response.ok) {
      return response.body.library;
    }
    return null;
  });
};

export const addLibrary = (library) => {
  const addUrl = `${API_URL}library`;
  return addORupdateLibrary(library, addUrl);
};

export const updateLibrary = (library) => {
  const updateUrl = `${API_URL}library/${library.id}`;
  return addORupdateLibrary(library, updateUrl);
};

export const deleteLibrary = libraryId =>
request.del(`${API_URL}library/${libraryId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return null;
  }
  return response.body.message;
});

export const addSelectedLibraryToUser = (libraryId) =>
request.post(`${API_URL}library/${libraryId}/selection`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.message;
  }
  return null;
});

export const removeSelectedLibraryFromUser = (libraryId) =>
request.del(`${API_URL}library/${libraryId}/selection`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.message;
  }
  return null;
});
