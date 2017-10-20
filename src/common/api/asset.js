import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';

export const fetchTypedAssetsListByLibrary = (libraryId, assetType) =>
request.get(`${API_URL}library/${libraryId}/assets/${assetType}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.assets;
  }
  return [];
});

export const fetchStoryAssetList = storyId =>
request.get(`${API_URL}story/${storyId}/assets`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.assets;
  }
  return [];
});

export const fetchAsset = assetId =>
request.get(`${API_URL}asset/${assetId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.asset;
  }
  return null;
});

const postAsset = (asset, file, type, progressHandler) => {
  const {
    nameEn,
    nameTw,
    nameJp,
    users,
    creditsUrl,
  } = asset;

  if (nameEn.length === 0) return Promise.reject('Asset name cannot be empty.');
  const meta = {
    nameEn,
    nameTw,
    nameJp,
    creditsUrl,
  };
  if (users) meta.credits = users.map(user => user.id);
  if (asset.characterId) meta.characterId = asset.characterId;

  const url = (type ?
    `${API_URL}library/${asset.libraryId}/assets/${type}` :
    `${API_URL}asset/${asset.id}`
  );

  let post = request
  .post(url)
  .withCredentials()
  .set(API_HEADER)
  .field('meta', JSON.stringify(meta));

  if (file) {
    post = post.attach('asset', file);
    post = post.on('progress', (e) => {
      if (progressHandler) progressHandler(e.percent);
    });
  }

  return post.then((response) => {
    if (response.ok) {
      return response.body.asset;
    }
    return null;
  });
};

export const addAsset = (asset, file, type, progressHandler) =>
postAsset(asset, file, type, progressHandler);

export const updateAsset = (asset, file) => postAsset(asset, file);

export const deleteAsset = assetId =>
request.del(`${API_URL}asset/${assetId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.message;
  }
  return null;
});
