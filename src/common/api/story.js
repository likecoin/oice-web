import request from 'superagent';

import { API_URL, API_HEADER } from '../constants';
import Converter from './converter';


export const fetchStories = () =>
  request.get(`${API_URL}story`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.stories;
      }
      return [];
    });

export const fetchFeaturedStory = language =>
  request.get(`${API_URL}story/featured`)
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.stories;
      }
      return [];
    });

export const addStory = name =>
  request.post(`${API_URL}story`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.story;
      }
      return null;
    });

export const updateStory = (story, language) => {
  const {
    id, name, description, coverImage, ogImageFile,
  } = story;
  let post = request.post(`${API_URL}story/${id}`).withCredentials();
  const meta = {};
  if (name.length === 0) return Promise.reject(new Error('Oice name empty!'));
  meta.name = name;
  meta.description = description;

  post = post.query({ language })
    .field('meta', JSON.stringify(meta))
    .set(API_HEADER);

  if (coverImage) {
    post = post.attach('coverStorage', coverImage);
    post = post.on('progress', (e) => {
      console.log('upload coverStorage progress', e);
    });
  }

  if (ogImageFile) {
    post = post.attach('ogImage', ogImageFile);
    post = post.on('progress', (e) => {
      console.log('upload ogImage progress', e);
    });
  }

  return post.then((response) => {
    if (response.ok) {
      return response.body.story;
    }
    return null;
  });
};


export const deleteStory = storyId =>
  request.del(`${API_URL}story/${storyId}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return null;
      }
      return response.body.message;
    });

export const fetchStory = (storyId, language) =>
  request.get(`${API_URL}story/${storyId}`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.story;
      }
      return [];
    });

export const addLibraryToStory = (storyId, libraryId) =>
  request.post(`${API_URL}story/${storyId}/library/${libraryId}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.message;
      }
      return null;
    });

export const removeLibraryFromStory = (storyId, libraryId) =>
  request.del(`${API_URL}story/${storyId}/library/${libraryId}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.message;
      }
      return null;
    });

export const build = storyId =>
  request.get(`${API_URL}story/${storyId}/build`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => response.body);

export const countStoryWord = (storyId, language) =>
  request.get(`${API_URL}story/${storyId}/wordcount`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.wordcount;
      }
      return null;
    });

export const fetchLanguage = (storyId, language = 'none') =>
  request.get(`${API_URL}story/${storyId}/language/${language}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.languages;
      }
      return null;
    });

export const addLanguage = (storyId, language) =>
  request.post(`${API_URL}story/${storyId}/language/${language}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.languages;
      }
      return null;
    });

export const deleteLanguage = (storyId, language) =>
  request.del(`${API_URL}story/${storyId}/language/${language}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.languages;
      }
      return null;
    });

export const translate = (storyId, payload) =>
  request.post(`${API_URL}story/${storyId}/translate`)
    .withCredentials()
    .set(API_HEADER)
    .send(payload)
    .then((response) => {
      if (response.ok) {
        return response.body.story;
      }
      return null;
    });

export const getTranslatedStoryOiceTitle = ({ storyId, language }) =>
  request.get(`${API_URL}story/${storyId}/translate`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.result;
      }
      return null;
    });
