import {
  createAction,
  handleActions,
} from 'redux-actions';

// Action Creators
export const toggleAlertDialog = createAction('TOGGLE_ALERT_DIALOG');

// Reducers
const initialState = {
  open: false,
  title: '',
  body: '',
  confirmTitle: '',
  cancelTitle: '',
  type: 'confirm',
};

export default handleActions({
  [toggleAlertDialog]: (state, { payload }) => (payload ? ({
    ...initialState,
    ...payload,
    open: true,
  }) : ({
    ...state,
    open: false,
  })),
}, initialState);
