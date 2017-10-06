import { createAction } from 'redux-actions';
import { replace } from 'react-router-redux';
import async from 'async';

import _assign from 'lodash/assign';
import _keys from 'lodash/keys';
import _forOwn from 'lodash/forOwn';
import _get from 'lodash/get';

import * as StoryAPI from 'common/api/story';
import * as OiceAPI from 'common/api/oice';
import { APIHandler } from 'common/utils/api';

import * as BlockAction from 'editor/actions/block';
import * as OiceAction from 'editor/actions/oice';
import * as StoryAction from 'editor/actions/story';

// Utility functions

// get story id from current story setting modal state
const getStoryId = (state) => {
  const { content, mainLanguage } = state.editorPanel.StorySettingModal;
  return content[mainLanguage].story.id;
};

// reorder fetched oices according to user updated
const reorderOiceList = (state, oices) => {
  const { deleted, mainLanguage, content, hasUpdatedOiceOrder } = state.editorPanel.StorySettingModal;
  let updatedOiceList = oices.filter(oice => !deleted.oices.includes(oice.id));
  if (hasUpdatedOiceOrder) {
    const currentOices = content[mainLanguage].oices;
    // reorder oice according to settings operated by users
    updatedOiceList = oices.reduce((reorderedOices, oice, i) => {
      const index = currentOices.findIndex(({ id }) => id === oice.id);
      reorderedOices[index] = oice; // eslint-disable-line no-param-reassign
      return reorderedOices;
    }, new Array(updatedOiceList.length));
  }
  return updatedOiceList;
};

// Global modal
export const toggleStorySettingModal = createAction('STORY_SETTING_MODAL_TOGGLE');
export const toggle = ({ open, story, tabBarIndex }) => (dispatch, getState) => {
  let payload = { open, tabBarIndex };
  if (story) {
    const storyList = getState().stories.list;
    const selectedStory = storyList.find(s => story.id === s.id);
    // get the story of main language
    payload = _assign(payload, {
      story: selectedStory,
    });
  }
  dispatch(toggleStorySettingModal(payload));
};

export const updateTabBarIndex = createAction('STORY_SETTING_MODAL_TAB_BAR_INDEX_UPDATE');

// action after save to sync store
export const saveStoryEnd = createAction('STORY_SAVE_END');
export const saveOiceOrderEnd = createAction('OICE_ORDER_SAVE_END');
export const saveOicesEnd = createAction('OICES_SAVE_END');
export const saveSelectedOiceEnd = createAction('SELECTED_OICE_SAVE_END');
export const saveNewLanguagesEnd = createAction('NEW_LANGUAGE_SAVE_END');
export const saveDeletedLanguagesEnd = createAction('DELETED_LANGUAGES_SAVE_END');

export const deleteOicesEnd = createAction('OICES_DELETE_END');

export const saveStorySettingModalBegin = createAction('STORY_SETTING_MODAL_SAVE_BEGIN');
export const saveStorySettingModal = () => async (dispatch, getState) => {
  const {
    content,
    updated,
    mainLanguage,
    newLanguages,
    supportedLanguages,
    hasUpdatedOiceOrder,
    deleted,
  } = getState().editorPanel.StorySettingModal;
  const storyId = getStoryId(getState());

  dispatch(saveStorySettingModalBegin());

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-loop-func */
  // TODO: temporary solution to make synchronous when deleting oice
  for (const oiceId of deleted.oices) {
    await APIHandler(dispatch, OiceAPI.deleteOice(oiceId)
      .then(() => {
        dispatch(deleteOicesEnd({ oiceIds: deleted.oices }));
      })
    );
  }

  for (const language of deleted.languages) {
    await APIHandler(dispatch, StoryAPI.deleteLanguage(storyId, language)
      .then((languages) => {
        dispatch(saveDeletedLanguagesEnd({ language }));
      })
    );
  }

  // initialize story and oice requests
  const storyRequests = [];
  let oiceRequests = [];

  // loop updated state and add updated story/oice to requests respectively
  _forOwn(updated, (updatedObject, language) => {
    const { story, oices } = updatedObject;

    // only save updates for language supported originally, handle story translate later
    if (newLanguages.includes(language)) return;

    if (story) {
      storyRequests.push(
        APIHandler(dispatch, StoryAPI.updateStory(content[language].story, language))
      );
    }
    if (oices.size > 0) {
      const updatedOices = content[language].oices.filter(oice => (
        // get oice included in updated oice ids
        oices.has(oice.id)
      ));
      oiceRequests = oiceRequests.concat(updatedOices.map(o => APIHandler(dispatch, OiceAPI.updateOice(o, language))));
    }
  });


  const newLanguageRequests = newLanguages.map(
    language => APIHandler(dispatch,
      StoryAPI.translate(storyId, {
        soruceLanguage: mainLanguage,
        targetLanguage: language,
        story: {
          name: content[language].story.name,
          description: content[language].story.description,
        },
        oices: content[language].oices.map(oice => ({
          id: oice.id,
          name: oice.name,
        })),
      }),
    )
  );

  async.parallel({
    stories: (callback) => {
      Promise.all(storyRequests).then(stories => callback(null, stories));
    },
    oices: (callback) => {
      Promise.all(oiceRequests).then(oices => callback(null, oices));
    },
    oiceOrder: (callback) => {
      if (hasUpdatedOiceOrder) {
        const updatedOiceList = content[mainLanguage].oices;
        APIHandler(dispatch, OiceAPI.updateOicesOrder(storyId, updatedOiceList)
          .then(() => {
            callback(null, { oiceList: updatedOiceList });
          })
        );
      } else {
        callback();
      }
    },
    translatedStories: (callback) => {
      Promise.all(newLanguageRequests).then(translatedStories => callback(null, translatedStories));
    },
  }, (error, result) => {
    const { stories, oices, oiceOrder, translatedStories } = result;

    if (stories.length > 0) {
      const mainStory = stories.find(story => _get(story, 'language') === mainLanguage);
      if (mainStory) {
        dispatch(saveStoryEnd({ story: mainStory }));
      }
    }

    const selectedOice = getState().oices.selected;

    if (oices.length > 0) {
      const mainOices = oices.filter(oice => oice.language === mainLanguage);
      dispatch(saveOicesEnd({ oices: mainOices }));

      if (selectedOice) {
        const updatedSelectedOice = oices.find(oice => oice.language === selectedOice.language && oice.id === selectedOice.id);
        if (updatedSelectedOice) {
          dispatch(saveSelectedOiceEnd({ oice: updatedSelectedOice }));
        }
      }
    }

    if (oiceOrder) {
      dispatch(saveOiceOrderEnd(oiceOrder));
    }

    // update blocks, selected oice and story if needed
    const isInEditorPanel = !!getState().stories.supportedLanguages;
    let selectedLanguage;
    if (translatedStories.length > 0) {
      const languages = translatedStories.map(story => story.language);
      dispatch(saveNewLanguagesEnd({ languages }));

      // check whether user is in editor panel, if yes, update them to one of the new language
      if (isInEditorPanel) {
        selectedLanguage = languages[0];
        dispatch(StoryAction.selectedStory(translatedStories[0]));
      }
    } else {
      // if currently modifying language is deleted, bring them to main language
      const isSelectedLanguageDeleted = isInEditorPanel && deleted.languages.includes(getState().blocks.selectedLanguage);
      if (isSelectedLanguageDeleted) {
        selectedLanguage = mainLanguage;
        dispatch(StoryAction.selectedStory(content[selectedLanguage].story));
      }
    }
    if (selectedLanguage) {
      dispatch(BlockAction.fetchBlocks(getState().oices.selected.id, selectedLanguage));
      dispatch(OiceAction.fetchSelectedOice(selectedOice.id, selectedLanguage));
    }


    const isSelectedOiceDeleted = selectedOice && deleted.oices.includes(selectedOice.id);
    if (isSelectedOiceDeleted) {
      dispatch(replace('/dashboard'));
    }

    dispatch(toggle({ open: false }));
  });
};

export const deleteStoryEnd = createAction('STORY_DELETE_END');
export const deleteStory = () => async (dispatch, getState) => {
  const storyId = getStoryId(getState());
  await APIHandler(dispatch, StoryAPI.deleteStory(storyId));

  const selectedStory = getState().stories.selected;
  const isSelectedStoryDeleted = selectedStory && selectedStory.id === storyId;
  if (isSelectedStoryDeleted) {
    dispatch(replace('/dashboard'));
  }

  dispatch(deleteStoryEnd({ storyId }));
  dispatch(toggle({ open: false }));
};

// Oice Setting Tab

export const fetchOicesBegin = createAction('OICES_FETCH_BEGIN');
export const fetchOicesEnd = createAction('OICES_FETCH_END');
export const fetchOices = ({ id, language }) => (dispatch) => {
  dispatch(fetchOicesBegin());
  APIHandler(dispatch,
    OiceAPI.fetchOices(id, language)
    .then((oices) => {
      dispatch(fetchOicesEnd({ oices, language }));
    })
  );
};

// Language Setting Tab

export const fetchLanguageBegin = createAction('LANGUAGE_FETCH_BEGIN');
export const fetchLanguageEnd = createAction('LANGUAGE_FETCH_END');
export const fetchLanguage = ({ id, language }) => async (dispatch, getState) => {
  dispatch(fetchLanguageBegin());
  const languages = await APIHandler(dispatch, StoryAPI.fetchLanguage(id, language));
  dispatch(fetchLanguageEnd({
    // exclude the main language of the story (which is the last one)
    supportedLanguages: languages.slice(0, -1),
  }));
};

export const fetchStoryOiceWithLanguageBegin = createAction('STORY_OICE_WITH_LANGUAGE_FETCH_BEGIN');
export const fetchStoryOiceWithLanguageEnd = createAction('STORY_OICE_WITH_LANGUAGE_FETCH_END');
export const fetchStoryOiceWithLanguage = language => async (dispatch, getState) => {
  const storyId = getStoryId(getState());

  async.parallel({
    story: (callback) => {
      APIHandler(dispatch, StoryAPI.fetchStory(storyId, language)
        .then(story => callback(null, story))
      );
    },
    oices: (callback) => {
      APIHandler(dispatch, OiceAPI.fetchOices(storyId, language)
        .then((oices) => {
          callback(null, reorderOiceList(getState(), oices));
        })
      );
    },
  }, (error, result) => {
    const { story, oices } = result;
    dispatch(fetchStoryOiceWithLanguageEnd({
      story,
      oices,
      language,
    }));
  });
};

// Update story settings
export const updateStoryName = createAction('STORY_NAME_UPDATE');
export const updateStoryDescription = createAction('STORY_DESCRIPTION_UPDATE');
export const updateStoryCover = createAction('STORY_COVER_UPDATE');
export const saveStoryOgImageEnd = createAction('STORY_OG_IMAGE_SAVE_END');
export const saveStoryOgImage = ({ language, story, ogImage, ogImageFile }) => async (dispatch) => {
  const newStory = await APIHandler(dispatch,
    StoryAPI.updateStory({
      ...story,
      ogImageFile,
    }, language)
  );
  dispatch(saveStoryOgImageEnd({
    story: {
      ogImage: newStory.ogImage,
    },
    language,
  }));
};

// Update oice settings
export const updateOiceOrder = createAction('OICE_ORDER_UPDATE');
export const updateOiceName = createAction('OICE_NAME_UPDATE');
export const updateOiceSharingOption = createAction('OICE_SHARING_OPTION_UPDATE');
export const updateOiceDeletion = createAction('OICE_DELETION_UPDATE');

// Update language settings

export const updateStoryLanguageBegin = createAction('STORY_LANGUAGE_UPDATE_BEGIN');
// export const updateStoryLanguageEnd = createAction('STORY_LANGUAGE_UPDATE_END');
export const updateStoryLanguage = ({ language }) => async (dispatch, getState) => {
  dispatch(updateStoryLanguageBegin({ language }));
  // translate story name and detail and oice names first for preview
  const storyId = getStoryId(getState());
  const { story, oices } = await APIHandler(dispatch,
    StoryAPI.getTranslatedStoryOiceTitle({
      storyId,
      language,
    })
  );

  const updatedOiceList = reorderOiceList(getState(), oices);
  dispatch(fetchStoryOiceWithLanguageEnd({
    oices: updatedOiceList,
    language,
    story,
  }));
};

export const removeStoryLanguage = createAction('STORY_LANGUAGE_REMOVE');

export const fetchStoryWordCountEnd = createAction('STORY_WORD_COUNT_FETCH_END');
export const fetchStoryWordCount = (storyId, language) => async (dispatch) => {
  const wordCount = await APIHandler(dispatch,
    StoryAPI.countStoryWord(storyId, language)
  );
  dispatch(fetchStoryWordCountEnd({
    language,
    wordCount,
  }));
};

export const fetchOiceWordCountBegin = createAction('OICE_WORD_COUNT_FETCH_BEGIN');
export const fetchOiceWordCountEnd = createAction('OICE_WORD_COUNT_FETCH_END');
export const fetchOiceWordCount = (oice, index) => async (dispatch) => {
  if (oice.wordCount > 0 || oice.isCounting) {
    return;
  }
  const wordCount = await APIHandler(dispatch,
    OiceAPI.countOiceWord(oice.id, oice.language)
  );
  dispatch(fetchOiceWordCountEnd({
    language: oice.language,
    wordCount,
    index,
  }));
};
