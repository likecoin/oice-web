import { handleActions } from 'redux-actions';

import { actions as ProfileActions } from 'web/pages/Profile';
import * as Actions from '../actions/user';


const initialState = {
  isAuthenticated: false,
  isLoggedIn: false,
  isLoggingIn: false,
};

export default handleActions({
  [Actions.updateUser]: (state, { payload, error }) => {
    if (error) {
      return {
        ...state,
      };
    }

    return {
      ...state,
      ...payload,
      isLoggedIn: typeof payload === 'object',
      isLoggingIn: false,
      isAuthenticated: true,
    };
  },
  [Actions.willLogin]: state => ({
    ...state,
    isLoggingIn: true,
  }),
  '@@router/LOCATION_CHANGE': state => state,
  [ProfileActions.updatedUserAvatar]: (state, { payload }) => ({
    ...state,
    avatar: payload,
  }),
}, initialState);
