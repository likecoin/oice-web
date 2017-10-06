import { createAction } from 'redux-actions';
import * as OiceAPI from 'common/api/oice';
import { APIHandler } from 'common/utils/api';

import * as StoryAction from 'editor/actions/story';

const openStoryListModal = createAction('OPEN_STORY_LIST_MODAL');
const openOiceListModal = createAction('OPEN_OICE_LIST_MODAL');
const closeStoryListOice = createAction('CLOSE_STORY_OICE_BROWSER');
const setSelectedTabIndex = createAction('SET_TAB_INDEX_IN_STORY_OICE_BROWSER');

const selectStory = createAction('SELECT_STORY_IN_STORY_OICE_BROWSER');

const beginFetchOices = createAction('BEGIN_FETCH_OICES_IN_OICE_LIST');
const fetchedOices = createAction('END_FETCH_OICES_IN_OICE_LIST');
const fetchOices = (selectedStoryId, onRequestAddOice) => (dispatch) => {
  dispatch(beginFetchOices());
  APIHandler(dispatch,
    OiceAPI.fetchOices(selectedStoryId)
    .then((oices) => {
      dispatch(fetchedOices(oices));
      if (onRequestAddOice && oices.length === 0) onRequestAddOice();
    })
  );
};

const beginAddOice = createAction('BEGIN_ADD_OICE_IN_STORY_OICE_BROWSER');
const addedOice = createAction('ADD_OICE_IN_STORY_OICE_BROWSER');
const addOice = (newOiceName, storyId) => (dispatch) => {
  dispatch(beginAddOice());
  APIHandler(dispatch,
    OiceAPI.addOice(newOiceName, storyId)
    .then((oice) => {
      dispatch(addedOice(oice));
      dispatch(StoryAction.fetchStoryLanguages(oice.storyId));
    })
  );
};

const updatedOicesOrder = createAction('UPDATE_OICES_ORDER_IN_STORY_OICE_BROWSER');
const updateOicesOrder = (storyId, oices) => (dispatch) => {
  dispatch(updatedOicesOrder(oices));
  APIHandler(dispatch,
    OiceAPI.updateOicesOrder(storyId, oices)
  );
};

const updateIsAddingStatus = createAction('UPDATE_IS_ADDING_STATUS');

export default {
  addedOice,
  addOice,
  beginAddOice,
  beginFetchOices,
  closeStoryListOice,
  fetchedOices,
  fetchOices,
  openOiceListModal,
  openStoryListModal,
  selectStory,
  setSelectedTabIndex,
  updatedOicesOrder,
  updateOicesOrder,
  updateIsAddingStatus,
};
