import {
  createAction,
  handleActions,
} from 'redux-actions';

import { toggleAlertDialog } from 'ui-elements/AlertDialog/redux';

// Reducers
const initialState = {
  selected: [],
  mine: [],
  public: [],
};

export default handleActions({
  FETCH_LIBRARIES_BY_STORY: (state, { payload }) => ({
    ...state,
    selected: payload.selected,
    mine: payload.mine,
    public: payload.public,
  }),
  FETCH_LIBRARIES: (state, { payload }) => ({
    ...state,
    mine: payload.mine,
    public: payload.public,
    selected: [],
  }),
  ADD_LIBRARY: (state, { payload }) => ({
    ...state,
    mine: [...state.mine, payload],
  }),
  UPDATE_LIBRARY: (state, { payload }) => ({
    ...state,
  }),
  DELETE_LIBRARY: (state, { payload }) => ({
    ...state,
  }),
  ADD_LIBRARY_TO_STORY: (state, { payload }) => ({
    ...state,
  }),
  REMOVE_LIBRARY_FROM_STORY: (state, { payload }) => ({
    ...state,
  }),
}, initialState);
