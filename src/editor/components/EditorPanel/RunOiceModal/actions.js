import { createAction } from 'redux-actions';

const open = createAction('OPEN_RUN_OICE_MODAL');
const close = createAction('CLOSE_RUN_OICE_MODAL');

export default {
  open,
  close,
};
