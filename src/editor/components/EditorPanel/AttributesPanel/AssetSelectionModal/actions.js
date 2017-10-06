import { createAction } from 'redux-actions';


export default {
  open: createAction('OPEN_ASSET_SELECTION_MODAL'),
  close: createAction('CLOSE_ASSET_SELECTION_MODAL'),
};
