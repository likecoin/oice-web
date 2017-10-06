import { createAction } from 'redux-actions';

export const toggle = createAction('TOGGLE_ITEM_MODAL');
export const willAdd = createAction('ADD_ITEM_BEGIN');
export const didAdd = createAction('ADD_ITEM_END');
export const didUpdate = createAction('UPDATE_ITEM');
export const willDelete = createAction('DELETE_ITEM_BEGIN');
export const didDelete = createAction('DELETE_ITEM_END');
