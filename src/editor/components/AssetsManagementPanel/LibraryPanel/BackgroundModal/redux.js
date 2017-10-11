import {
  createAction,
  handleActions,
} from 'redux-actions';

// Actions
const TOGGLE_BACKGROUND_MODAL = 'TOGGLE_BACKGROUND_MODAL';

// Reducers
const initialState = {
  open: false,
  background: null,
};

export default handleActions({
  TOGGLE_BACKGROUND_MODAL: (state, { payload }) => ({
    ...state,
    open: payload.open,
    background: payload.open ? payload.asset : null,
  }),
  ADD_BACKGROUND: (state, { payload }) => ({
    ...state,
    open: false,
  }),
  UPDATE_BACKGROUND: (state, { payload }) => ({
    ...state,
    open: false,
    background: payload,
  }),
  DELETE_BACKGROUND: (state, { payload }) => ({
    ...state,
    open: false,
  }),
}, initialState);

// Action Creators
export const toggleBackgroundModal = createAction(TOGGLE_BACKGROUND_MODAL);
