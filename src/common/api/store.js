import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';
import * as ASSET_TYPES from '../constants/assetTypes';


export const fetchLibraries = ({ type, offset, limit, alias, language }) =>
request
.get(`${API_URL}store/library${type ? `/list/${type}` : ''}${alias ? `/${alias}` : ''}`)
.query({ offset, limit, language })
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body;
  }
  return {
    libraries: [],
    pageNumber: 1,
    totalPages: 1,
  };
});

export const fetchLibraryDetails = libraryId =>
request
.get(`${API_URL}store/library/${libraryId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.library;
  }
  return null;
});

export const fetchLibraryAssetsByType = (libraryId, assetType) => {
  const isCharacterType = assetType === ASSET_TYPES.CHARACTER;
  return request
  .get(`${API_URL}store/library/${libraryId}/${
    isCharacterType ? 'character' : `assets/${assetType}`
  }`)
  .withCredentials()
  .set(API_HEADER)
  .then((response) => {
    if (response.ok) {
      return response.body[isCharacterType ? 'characters' : 'assets'];
    }
    return [];
  });
};

export const fetchPriceTiers = () =>
request
.get(`${API_URL}store/price`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.priceTiers;
  }
  return [];
});

export const purchaseLibrary = (libraryId, token) =>
request
.post(`${API_URL}store/library/${libraryId}/purchase`)
.send(token)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.library;
  }
  return [];
});
