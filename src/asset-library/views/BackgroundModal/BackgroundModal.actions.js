import { createAction } from 'redux-actions';

export const toggle = createAction('TOGGLE_BACKGROUND_MODAL');
export const willAdd = createAction('ADD_BACKGROUND_BEGIN');
export const didAdd = createAction('ADD_BACKGROUND');
export const willUpdate = createAction('UPDATE_BACKGROUND_BEGIN');
export const didUpdate = createAction('UPDATE_BACKGROUND');
export const didDelete = createAction('DELETE_BACKGROUND');
