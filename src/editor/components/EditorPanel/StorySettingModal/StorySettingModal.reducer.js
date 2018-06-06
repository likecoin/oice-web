import { handleActions } from 'redux-actions';
import update from 'immutability-helper';

import _cloneDeep from 'lodash/cloneDeep';
import _get from 'lodash/get';
import _uniq from 'lodash/uniq';

import * as Actions from './StorySettingModal.actions';
import {
  TAB_LIST,
  TAB_LIST_ITEM,
} from './StorySettingModal.constants';

// add command $auto for autovivification
update.extend('$auto', (value, object) => (object ? update(object, value) : update({}, value)));

const defaultUpdatedLanguageObject = {
  story: false,
  oices: new Set(),
};

const defaultLoading = TAB_LIST.reduce((loading, tab) => ({
  ...loading,
  [tab]: false,
}), {});

const initialState = {
  // status
  open: false, // whether modal is open
  saving: false, // whether modal is saving
  loading: defaultLoading, // tab loading bools
  tabBarIndex: 0, // indicate index of current tab

  // data
  content: {}, // store all contents in the modal, including changes
  mainLanguage: undefined, // indicate the main language of story
  supportedLanguages: [], // languages supported by the story originally

  // updated status
  updated: {}, // indicate which part of content has been updated by user
  hasUpdatedOiceOrder: false, // whether oice order has been updated
  newLanguages: [], // languages newly chosen by the user
  deleted: { // indicate oices / languages to be deleted
    oices: [],
    languages: [],
  },
};

function updateStoryState({ state, language, payload }) {
  return update(state, {
    content: {
      [language]: {
        story: { $merge: payload },
      },
    },
    updated: {
      [language]: {
        story: { $set: true }, // indicate an update of story
      },
    },
  });
}

function updateOiceState({
  state, language, oiceId, payload,
}) {
  const index = state.content[language].oices.findIndex(oice => oice.id === oiceId);
  const updatedOiceIds = state.updated[language].oices.add(oiceId);
  return update(state, {
    content: {
      [language]: {
        oices: { [index]: { $merge: payload } },
      },
    },
    updated: {
      [language]: {
        oices: { $set: updatedOiceIds },
      },
    },
  });
}

function updateLoadingTab(state, tabName) {
  return update(state, {
    loading: {
      [tabName]: { $set: true },
    },
  });
}


export default handleActions({
  [Actions.toggleStorySettingModal]: (state, { payload }) => {
    const { open, story, tabBarIndex = 0 } = payload;
    if (!story) return { ...initialState };
    return update(state, {
      content: {
        [story.language]: {
          $auto: {
            story: { $set: story },
          },
        },
      },
      updated: {
        [story.language]: {
          $auto: { $set: _cloneDeep(defaultUpdatedLanguageObject) },
        },
      },
      mainLanguage: { $set: story.language },
      open: { $set: open },
      tabBarIndex: { $set: tabBarIndex },
    });
  },
  [Actions.updateTabBarIndex]: (state, { payload }) => ({
    ...state,
    tabBarIndex: payload.tabBarIndex,
  }),
  [Actions.fetchOicesBegin]: state => ({
    ...state,
  }),
  [Actions.fetchOicesEnd]: (state, { payload }) => {
    const { oices, language } = payload;
    const newState = update(state, {
      content: {
        [language]: {
          oices: { $set: oices },
        },
      },
    });
    return newState;
  },
  [Actions.updateStoryName]: (state, { payload }) => (
    updateStoryState({
      language: payload.language,
      payload: { name: payload.storyName },
      state,
    })
  ),
  [Actions.updateStoryDescription]: (state, { payload }) => (
    updateStoryState({
      language: payload.language,
      payload: { description: payload.storyDescription },
      state,
    })
  ),
  [Actions.updateStoryCover]: (state, { payload }) => (
    updateStoryState({
      language: payload.language,
      payload: {
        cover: payload.cover,
        coverImage: payload.coverImage,
      },
      state,
    })
  ),
  [Actions.saveStoryOgImageEnd]: (state, { payload }) => (
    update(state, {
      content: {
        [payload.language]: {
          story: { $merge: payload.story },
        },
      },
    })
  ),
  [Actions.updateOiceOrder]: (state, { payload }) => {
    const { dragIndex, hoverIndex } = payload;
    return update(state, {
      content: {
        $apply: languages => Object.keys(languages).reduce((updatedContent, key) => ({
          ...updatedContent,
          [key]: update(languages[key], {
            oices: {
              $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, languages[key].oices[dragIndex]],
              ],
            },
          }),
        }), {}),
      },
      hasUpdatedOiceOrder: { $set: true },
    });
  },
  [Actions.updateOiceName]: (state, { payload }) => (
    updateOiceState({
      language: payload.language,
      oiceId: payload.oiceId,
      payload: { name: payload.oiceName },
      state,
    })
  ),
  [Actions.updateOiceSharingOption]: (state, { payload }) => (
    updateOiceState({
      language: payload.language,
      oiceId: payload.oiceId,
      payload: { sharingOption: payload.sharingOption },
      state,
    })
  ),
  [Actions.updateOiceDeletion]: (state, { payload }) => {
    const {
      content, mainLanguage, supportedLanguages, newLanguages,
    } = state;
    const loadedLanguage = [mainLanguage, ...supportedLanguages, ...newLanguages]
      .filter(language => !!_get(content, `[${language}].oices`));
    const oiceIndex = content[mainLanguage].oices.findIndex(oice => oice.id === payload.oiceId);
    return update(state, {
      content: {
        ...loadedLanguage.reduce((updatedLanguages, language) => ({
          ...updatedLanguages,
          [language]: {
            oices: { $splice: [[oiceIndex, 1]] },
          },
        }), {}),
      },
      deleted: { oices: { $push: [payload.oiceId] } },
    });
  },
  // Language Setting Actions
  [Actions.fetchLanguageBegin]: state => (
    update(state, {
      loading: {
        [TAB_LIST_ITEM.LANGUAGE]: { $set: true },
      },
    })
  ),
  [Actions.fetchLanguageEnd]: (state, { payload }) => (
    update(state, {
      supportedLanguages: { $set: payload.supportedLanguages },
      loading: {
        [TAB_LIST_ITEM.LANGUAGE]: { $set: false },
      },
    })
  ),
  [Actions.fetchStoryOiceWithLanguageBegin]: state => (
    updateLoadingTab(state, TAB_LIST_ITEM.LANGUAGE)
  ),
  [Actions.fetchStoryOiceWithLanguageEnd]: (state, { payload }) => (
    update(state, {
      content: {
        [payload.language]: {
          $auto: {
            story: { $set: payload.story },
            oices: { $set: payload.oices },
          },
        },
      },
      updated: {
        [payload.language]: {
          $auto: { $set: _cloneDeep(defaultUpdatedLanguageObject) },
        },
      },
      loading: {
        [TAB_LIST_ITEM.LANGUAGE]: { $set: false },
      },
    })
  ),
  [Actions.updateStoryLanguageBegin]: (state, { payload }) => (
    update(state, {
      loading: {
        [TAB_LIST_ITEM.LANGUAGE]: { $set: true },
      },
      newLanguages: { $push: [payload.language] },
    })
  ),
  [Actions.removeStoryLanguage]: (state, { payload }) => {
    const { language } = payload;
    let languageListUpdate = 'newLanguages';
    let index = state.newLanguages.findIndex(newLanguage => newLanguage === language);
    if (index === -1) {
      index = state.supportedLanguages.findIndex(supportedLanguage => supportedLanguage === language);
      languageListUpdate = 'supportedLanguages';
    }
    const updatedDeletedLanguage = _uniq([...state.deleted.languages, language]);
    return update(state, {
      content: {
        $auto: { $unset: [language] },
      },
      deleted: {
        languages: { $set: updatedDeletedLanguage },
      },
      updated: {
        [language]: { $set: _cloneDeep(defaultUpdatedLanguageObject) },
      },
      [languageListUpdate]: { $splice: [[index, 1]] },
    });
  },
  [Actions.saveStorySettingModalBegin]: state => ({
    ...state,
    saving: true,
  }),
  [Actions.fetchStoryWordCountEnd]: (state, { payload }) => (
    update(state, {
      content: {
        [payload.language]: {
          story: { $merge: { wordCount: payload.wordCount } },
        },
      },
    })
  ),
  [Actions.fetchOiceWordCountBegin]: (state, { payload }) => (
    update(state, {
      content: {
        [payload.language]: {
          oices: {
            [payload.index]: { $merge: { isCounting: true } },
          },
        },
      },
    })
  ),
  [Actions.fetchOiceWordCountEnd]: (state, { payload }) => (
    update(state, {
      content: {
        [payload.language]: {
          oices: {
            [payload.index]: {
              $merge: {
                wordCount: payload.wordCount,
                isCounting: false,
              },
            },
          },
        },
      },
    })
  ),
}, initialState);
