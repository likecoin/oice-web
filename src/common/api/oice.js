import request from 'superagent';
import { API_URL, API_HEADER, DOMAIN_URL, SRV_ENV } from '../constants';
import Converter from './converter';


export const fetchOices = (storyId, language) =>
  request.get(`${API_URL}story/${storyId}/oice`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.oices;
      }
      return null;
    });


export const addOice = storyId =>
  request.post(`${API_URL}story/${storyId}/oice`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.oice;
      }
      return null;
    });

export const updateOicesOrder = (storyId, oiceList) =>
  request.post(`${API_URL}story/${storyId}/oice/order`)
    .withCredentials()
    .set(API_HEADER)
    .send(oiceList)
    .then((response) => {
      if (response.ok) {
        return 'update oices order success';
      }
      return null;
    });

export const fetchOice = (oiceId, language) =>
  request.get(`${API_URL}oice/id/${oiceId}`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.oice;
      }
      return null;
    });

export const updateOice = (serializedOice, language) => {
  const {
    sharingOption,
    description,
    id,
    imageFile,
    isShowAd,
    name,
  } = serializedOice;

  let post = request.post(`${API_URL}oice/id/${id}`).withCredentials();

  const meta = {};
  if (name.length === 0) return Promise.reject(new Error('Oice name empty!'));
  meta.name = name;
  meta.description = description;
  meta.isShowAd = isShowAd;
  meta.sharingOption = sharingOption;
  post = post.query({ language })
    .field('meta', JSON.stringify(meta))
    .set(API_HEADER);

  return post.then((response) => {
    if (response.ok) {
      return response.body.oice;
    }
    return null;
  });
};

export const fork = oiceId =>
  request.post(`${API_URL}oice/${oiceId}/fork`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => response.body.oice);

export const copy = oiceId =>
  request.post(`${API_URL}oice/${oiceId}/copy`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => response.body.oice);

export const deleteOice = oiceId =>
  request.del(`${API_URL}oice/id/${oiceId}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return null;
      }
      return response.body.message;
    });

export const validateOice = (storyId, oiceId) =>
  request.get(`${API_URL}story/${storyId}/oice/${oiceId}/validate`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return Converter.convertErroredKSList(response.body.errors);
      }
      return null;
    });

export const importScript = ({
  oiceId, language, scriptFile, progressCallback,
}) =>
  request.post(`${API_URL}oice/${oiceId}/import`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .attach('script', scriptFile)
    .on('progress', progressCallback)
    .then(response => response.body.jobId);

export const exportOice = (storyId, oiceId) =>
  request.get(`${API_URL}story/${storyId}/oice/${oiceId}/export`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.id;
      }
      return null;
    });

export const buildOice = (storyId, oiceId, isPreview) =>
  request.get(`${API_URL}oice/${oiceId}/${isPreview ? 'preview' : 'build'}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return ({
          url: response.body.view_url,
          code: 200,
          message: 'response is okay, but do not mean build success',
        });
      }
      return ({
        code: 403,
        message: 'response is not okay',
      });
    });

// for oice web get og info
export const fetchOiceOgByUUID = (uuid, language) =>
  request.get(`${API_URL}oice/uuid/${uuid}`)
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      const { oice } = response.body;
      let protocol = 'http';
      switch (SRV_ENV) {
        case 'production':
        case 'kubernetes':
          protocol = 'https';
          break;
        default:
          break;
      }
      const viewUrl = `${protocol}://${oice.url}`;
      const url = viewUrl.replace('/view', '/story');
      return {
        ...oice,
        url,
        viewUrl,
      };
    });

export const fetchRelatedOices = oiceId =>
  request.get(`${API_URL}oice/${oiceId}/more`)
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.oices;
      }
      return [];
    });

export const fetchTutorialOices = () =>
  request.get(`${API_URL}oice/tutorial`)
    .set(API_HEADER)
    .then(response => (
      response.ok ? response.body.oices : []
    ));

export const fetchOiceCredits = id =>
  request.get(`${API_URL}credits/oice/${id}`)
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.credits;
      }
      return [];
    });

export const buildAll = storyId =>
  request.get(`${API_URL}oice/buildall`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => response.body);

export const fetchOicesFromUserStory = (userId, storyId) =>
  request.get(`${API_URL}user/${userId}/story/${storyId}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.oices;
      }
      return [];
    });

export const incrementOiceViewCount = oiceId =>
  request.post(`${API_URL}oice/${oiceId}/viewCount`)
    .withCredentials()
    .set(API_HEADER)
    .then(response => response.ok);

export const fetchOicePlaintext = (oiceId, language) =>
  request.get(`${API_URL}oice/${oiceId}/plaintext`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.text;
      }
      return '';
    });

export const countOiceWord = (oiceId, language) =>
  request.get(`${API_URL}oice/${oiceId}/wordcount`)
    .withCredentials()
    .query({ language })
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.wordcount;
      }
      return null;
    });
