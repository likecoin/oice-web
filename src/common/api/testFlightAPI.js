import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';


export const addTester = email =>
  request.post(`${API_URL}testflight/invitation`)
    .set(API_HEADER)
    .send(JSON.stringify({ email }))
    .then(response => response.body);
