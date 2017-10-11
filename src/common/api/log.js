import request from 'superagent';

import { API_URL, API_HEADER, LOG_KEY } from '../constants';

export const log = ({ name, data }) =>
request.post(`${API_URL}log/${name}`)
.withCredentials()
.set(API_HEADER)
.set('Log-Key', LOG_KEY)
.send(data)
.then(response => response.body);
