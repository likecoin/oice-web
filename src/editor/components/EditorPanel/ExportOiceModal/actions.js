import { createAction } from 'redux-actions';

const open = createAction('OPEN_EXPORT_OICE_MODAL');
const close = createAction('CLOSE_EXPORT_OICE_MODAL');

export default {
  open,
  close,
};
