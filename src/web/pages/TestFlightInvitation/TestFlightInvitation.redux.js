import { createAction, handleActions } from 'redux-actions';
import { APIHandler } from 'common/utils/api';

import * as TestFlightAPI from 'common/api/testFlightAPI';


// Action Creators
const willSendInvitation = createAction('TESTFLIGHT_INVITATION_WILL_SEND');
const didSendInvitation = createAction('TESTFLIGHT_INVITATION_DID_SEND');
export const reset = createAction('TESTFLIGHT_INVITATION_RESET');

export const sendInvitation = email => (dispatch) => {
  dispatch(willSendInvitation());
  return APIHandler(dispatch,
    TestFlightAPI
    .addTester(email)
    .then(response => dispatch(didSendInvitation(response))),
    null,
    [
      'ERR_TESTFLIGHT_INVALID_TESTER_EMAIL',
      'ERR_TESTFLIGHT_ADD_TESTER_FAILURE',
      'ERR_TESTFLIGHT_TESTER_EXIST',
      'ERR_TESTFLIGHT_RESEND_INVITATION_FAILURE',
    ],
    error => dispatch(didSendInvitation(error))
  );
};


// Reducers
const initialState = {
  isSending: false,
  isSent: false,
  errorMessage: undefined,
};

export default handleActions({
  [willSendInvitation]: state => ({
    ...state,
    isSending: true,
    errorMessage: undefined,
  }),
  [didSendInvitation]: (state, { payload }) => {
    if (!state.isSending) {
      return state;
    }
    return ({
      ...state,
      isSending: false,
      isSent: payload.code === 200,
      errorMessage: payload.code === 200 ? undefined : payload.message,
    });
  },
  [reset]: () => initialState,
}, initialState);
