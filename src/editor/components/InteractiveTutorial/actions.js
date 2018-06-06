import { createAction } from 'redux-actions';
import { replace } from 'react-router-redux';
import { APIHandler } from 'common/utils/api';
import request from 'superagent';
import update from 'immutability-helper';

import * as OiceAPI from 'common/api/oice';
import * as StoryAction from 'editor/actions/story';
import * as UserAction from 'common/actions/user';

import i18next, { mapLanguageCode } from 'common/utils/i18n';


const beginLoading = createAction('BEGIN_LOAD_INTERACTIVE_TUTORIAL');
const endLoading = createAction('END_LOAD_INTERACTIVE_TUTORIAL');
const achieve = createAction('ACHIEVE_INTERACTIVE_TUTORIAL_CHECKPOINT');
const revert = createAction('REVERT_INTERACTIVE_TUTORIAL_CHECKPOINT');
const next = createAction('GO_NEXT_INTERACTIVE_TUTORIAL_CHECKPOINT');
const back = createAction('GO_PRVEVIOUS_INTERACTIVE_TUTORIAL_CHECKPOINT');
const skip = createAction('SKIP_INTERACTIVE_TUTORIAL');
const close = createAction('CLOSE_INTERACTIVE_TUTORIAL');
const setVariable = createAction('SET_INTERACTIVE_TUTORIAL_VARIABLE');
const jumpTo = createAction('JUMP_TO_INTERACTIVE_TUTORIAL_CHECKPOINT');

export const open = (volume, startFromStep = null) => (dispatch) => {
  dispatch(beginLoading());
  const promise = request.get(`/static/interactive-tutorial/volumes/${volume}.json`)
    .set('Accept', 'application/json')
    .then(response => response.body);
  switch (volume) {
    case 1:
      promise.then((tutorial) => {
        const language = mapLanguageCode(i18next.language);
        const forkOiceId = tutorial.forkOiceId[language] || tutorial.forkOiceId.en;

        OiceAPI.fork(forkOiceId)
          .then(oice => dispatch(StoryAction.fetchStories())
            .then(() => {
              dispatch(setVariable({ storyId: oice.storyId }));
              dispatch(endLoading({ tutorial, startFromStep }));
              dispatch(replace('/dashboard'));
            })
          );
      });
      break;
    default:
      promise.then(tutorial => dispatch(endLoading({ tutorial, startFromStep })));
      break;
  }
  APIHandler(dispatch, promise);
};

export const updateUserTutorialState = index => (dispatch, getState) => {
  const { user } = getState();
  const meta = {
    tutorialState: update(user.tutorialState, {
      [index]: { $set: true },
    }),
  };
  dispatch(UserAction.updateUserMeta({ meta }));
};

export default {
  beginLoading,
  endLoading,
  achieve,
  revert,
  open,
  next,
  back,
  skip,
  close,
  setVariable,
  jumpTo,
};
