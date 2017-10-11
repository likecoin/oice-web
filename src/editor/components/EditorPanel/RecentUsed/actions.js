import { createAction } from 'redux-actions';


export default {
  initialize: createAction('INITIALIZE_RECENT_USED_ASSETS'),
  get: createAction('GET_RECENT_USED_ASSETS'),
  push: createAction('PUSH_RECENT_USED_ASSETS'),
};
