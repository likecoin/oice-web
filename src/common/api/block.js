import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';
import Converter from './converter';

export const fetchBlocks = (oiceId, language) =>
request.get(`${API_URL}oice/${oiceId}/blocks`)
.withCredentials()
.query({ language })
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return response.body.blocks;
  }
  return [];
});


export const addBlock = (oiceId, serializedBlock, isDrag) => {
  const payload = Converter.convertBlockToJSON(serializedBlock);
  payload.isDrag = isDrag;
  return request.post(`${API_URL}oice/${oiceId}/blocks`)
  .withCredentials()
  .set(API_HEADER)
  .send(payload)
  .then((response) => {
    if (response.ok) {
      return response.body.block;
    }
    return null;
  });
};

// save block
export const updateBlock = (blockId, attributes, language) =>
request.post(`${API_URL}block/${blockId}`)
.withCredentials()
.query({ language })
.set(API_HEADER)
.send(Converter.serializeAttributes(attributes))
.then((response) => {
  if (response.ok) {
    return response.body.block;
  }
  return null;
});

export const updateBlocks = (blocksToBeSavedArray, language) =>
request.put(`${API_URL}blocks`)
.withCredentials()
.query({ language })
.set(API_HEADER)
.send(Converter.serializedBlocksToBeSaved(blocksToBeSavedArray))
.then((response) => {
  if (response.ok) {
    return response.body.blocks;
  }
  return null;
});

// move up/down list
export const moveBlock = (blockId, parentId) =>
request.put(`${API_URL}block/${blockId}`)
.withCredentials()
.set(API_HEADER)
.send({ parentId })
.then((response) => {
  if (response.ok) {
    return response.body.block;
  }
  return null;
});

export const deleteBlock = blockId =>
request.del(`${API_URL}block/${blockId}`)
.withCredentials()
.set(API_HEADER)
.then((response) => {
  if (response.ok) {
    return null;
  }
  return response.body.message;
});
