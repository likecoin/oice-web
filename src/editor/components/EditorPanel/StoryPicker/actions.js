import { createAction } from 'redux-actions';


export const open = createAction('OPEN_STORY_PICKER');
export const close = createAction('CLOSE_STORY_PICKER');

export default {
  open,
  close,
};
