import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';

export const postLikeCoinTx = ({ tx, type }) =>
  request.post(`${API_URL}likecoin/tx/product/${type}`)
    .withCredentials()
    .send(tx)
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body;
      }
      return null;
    });

export const validateLikeCoinTx = ({ id, ...tx }) =>
  request.put(`${API_URL}likecoin/tx/${id}/validate`)
    .withCredentials()
    .send(tx)
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.product;
      }
      return null;
    });
