import { createAction } from 'redux-actions';

import * as OiceAPI from 'common/api/oice';
import { APIHandler } from 'common/utils/api';

export const fetchTutorialOicesBegin = createAction('FETCH_TUTORIAL_OICE_BEGIN');
export const fetchTutorialOicesEnd = createAction('FETCH_TUTORIAL_OICE_END');
export const fetchTutorialOices = () => dispatch => APIHandler(dispatch,
  OiceAPI
  .fetchTutorialOices()
  .then(oices => dispatch(fetchTutorialOicesEnd(oices)))
);
