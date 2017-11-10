import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { translate } from 'react-i18next';

import uuid from 'uuid';

import _get from 'lodash/get';

import LoadingScreen from 'ui-elements/LoadingScreen';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import * as AssetAction from 'editor/actions/asset';
import * as CharacterAction from 'editor/actions/character';
import * as OiceAction from 'editor/actions/oice';
import * as StoryAction from 'editor/actions/story';

import {
  updateUserTutorialState,
} from 'editor/components/InteractiveTutorial/actions';

import USER_ROLE from 'common/constants/userRoles';
import {
  LOADING,
} from 'editor/constants/stageType';
import {
  TAB_LIST_ITEM,
  TAB_LIST,
} from 'editor/components/EditorPanel/StorySettingModal/StorySettingModal.constants';

import EditorMenu from './Menu';
import EditorToolbar from './Toolbar/index';
import EditorWorkspace from './Workspace';
import EmptyEditorWorkspace from './EmptyWorkspace';
import ExportOiceModal from './ExportOiceModal';
import ImportScriptModal, { actions as ImportScriptModalActions } from './ImportScriptModal';
import RunOiceModal from './RunOiceModal';
import StoryPicker from './StoryPicker';
import StorySettingModal, { actions as StorySettingModalActions } from './StorySettingModal';

import * as EditorPanelAction from './actions';

import { getComposedToBeSavedBlocks } from './util';

const getBuildId = () => uuid.v4();

const parseStringId = (id) => {
  const result = parseInt(id, 10);
  return result > 0 ? result : undefined;
};

@translate(['editor', 'macro'])
@connect(store => ({
  blockIdsToBeSaved: store.blocks.toBeSavedIds,
  blocksDict: store.blocks.blocksDict,
  dashboardOices: store.editorPanel.dashboard.oices,
  imageList: store.assets.imageList,
  loading: store.assets.loading || store.blocks.fetching || store.characters.loading || store.oices.fetching,
  oicesList: store.oices.list,
  selectedOice: store.oices.selected,
  selectedStory: store.stories.selected,
  selectedStoryId: store.editorPanel.dashboard.selectedStoryId,
  storiesList: store.stories.list,
  tutorialVolume: store.interactiveTutorial.volume,
  user: store.user,
}))
export default class EditorPanel extends React.Component {
  static propTypes = {
    blockIdsToBeSaved: PropTypes.any.isRequired,
    blocksDict: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    oicesList: PropTypes.array.isRequired,
    storiesList: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    dashboardOices: PropTypes.array,
    params: PropTypes.object,
    selectedOice: PropTypes.object,
    selectedStory: PropTypes.object,
    selectedStoryId: PropTypes.number,
    tutorialVolume: PropTypes.string,
    user: PropTypes.object,
  }

  static childContextTypes = {
    module: PropTypes.string,
  }

  getChildContext() {
    return { module: 'editor' };
  }

  componentDidMount() {
    const storyId = this.getStoryId();
    const oiceId = this.getOiceId();
    const { dispatch, dashboardOices, selectedStoryId } = this.props;

    if (storyId && oiceId) {
      // only attempt to fetch when storyId and oiceId are positive integer
      dispatch(OiceAction.fetchOices(storyId));
      dispatch(StoryAction.fetchStoryLanguages(storyId));
      dispatch(CharacterAction.fetchCharacter(storyId));
      dispatch(AssetAction.fetchStoryAssetList(storyId));
    }
  }

  componentWillUnmount() {
    this.props.dispatch(OiceAction.unselectOice());
    this.props.dispatch(StoryAction.unselectStory());
  }

  getStoryId = () => parseStringId(this.props.params.storyId);

  getOiceId = () => parseStringId(this.props.params.oiceId);

  getSelectedStory = (id = null) => {
    const storyId = id || this.getStoryId();
    const storiesList = this.props.storiesList;
    // default get from the storiesList, if localized will store in selectedStory
    return this.props.selectedStory || storiesList.find(story => story.id === storyId);
  }

  getSelectedOice = () => {
    const { oicesList, selectedOice } = this.props;
    // default get from the oicesList, if localized will store in selectedOice
    return selectedOice || oicesList.find(oice => oice.id === this.getOiceId());
  }

  getBlocksToBeSaved = () => {
    const { blockIdsToBeSaved, blocksDict } = this.props;
    return getComposedToBeSavedBlocks(blockIdsToBeSaved, blocksDict);
  }

  handleOpenStorySetting = (item) => {
    const selectedStory = this.getSelectedStory();
    this.props.dispatch(
      StorySettingModalActions.toggle({
        open: true,
        story: selectedStory,
        tabBarIndex: TAB_LIST.findIndex(tabListItem => item === tabListItem),
      })
    );
  }

  handleRunOiceButtonClick = (selectedOice, isPreview) => {
    if (selectedOice) {
      const jobId = getBuildId();
      this.props.dispatch(RunOiceModal.Action.open({
        preview: isPreview,
        id: jobId,
      }));
      if (this.closeSocketConnection) {
        this.closeSocketConnection();
        this.closeSocketConnection = null;
      }
      this.props.dispatch(OiceAction.runOice(
        selectedOice.storyId,
        selectedOice.id,
        this.getBlocksToBeSaved(),
        isPreview,
        jobId,
      ));
    }
  }

  handleExportOiceButtonClick = (selectedOice) => {
    if (selectedOice) {
      const jobId = getBuildId();
      this.props.dispatch(ExportOiceModal.Action.open({
        id: jobId,
      }));
      this.props.dispatch(OiceAction.exportOice(
        selectedOice.storyId,
        selectedOice.id,
        this.getBlocksToBeSaved(),
        jobId,
      ));
    }
  }

  handleRequestOpenImportScriptModal = () => {
    this.props.dispatch(ImportScriptModalActions.open());
  }

  handleAssetsMangementButtonClick = () => {
    if (this.props.tutorialVolume === 'c0e6d4e') {
      window.location.href = '/asset?action=tutorial&index=2&volume=2';
    } else {
      window.location.href = '/store';
    }
  }

  handleOpenTutorialRequest = (volume, index) => {
    const { dispatch, user } = this.props;
    dispatch(InteractiveTutorial.Action.open(volume));
    dispatch(updateUserTutorialState(index));
  }

  handleCloseRunOiceModalRequest = () => {
    this.props.dispatch(RunOiceModal.Action.close());
    this.resetOiceStage();
  }

  handleCloseExportOiceModalRequest = () => {
    this.props.dispatch(ExportOiceModal.Action.close());
    this.resetOiceStage();
  }

  resetOiceStage() {
    const serverInfo = {
      stage: LOADING,
      message: '',
      info: null,
    };
    this.props.dispatch(EditorPanelAction.updateRunOiceState(serverInfo));
  }

  renderEditorPanel(selectedOice, selectedStory) {
    if (!selectedOice) {
      const { user, dispatch, t } = this.props;
      return (
        <EmptyEditorWorkspace
          t={t}
          onLoad={() => {
            if (
              !user.isFirstLogin &&
              /\/edit\/?$/.test(window.location.pathname)
            ) {
              dispatch(replace('/dashboard'));
            }
          }}
        />
      );
    }
    return (
      <EditorWorkspace oice={selectedOice} story={selectedStory} />
    );
  }

  renderToolbar(selectedOice, selectedStory) {
    const { t, user } = this.props;
    return (
      <EditorToolbar
        menu={
          <EditorMenu
            t={t}
            tutorialState={user.tutorialState}
            userRole={user.role}
            onRequestOpenTutorial={this.handleOpenTutorialRequest}
          />
        }
        oiceName={!!selectedOice && selectedOice.name}
        storyName={!!selectedStory && selectedStory.name}
        user={user}
        onClickAssetManagement={this.handleAssetsMangementButtonClick}
        onClickExportOice={() => this.handleExportOiceButtonClick(selectedOice)}
        onClickImportButton={this.handleRequestOpenImportScriptModal}
        onClickOiceSetting={() => this.handleOpenStorySetting(TAB_LIST_ITEM.OICE)}
        onClickRunOice={() => this.handleRunOiceButtonClick(selectedOice, false)}
        onClickStorySetting={() => this.handleOpenStorySetting(TAB_LIST_ITEM.STORY)}
        onPreviewOiceButtonClick={() => this.handleRunOiceButtonClick(selectedOice, true)}
      />
    );
  }

  renderRunOiceModal(selectedOice) {
    return !!selectedOice && (
      <RunOiceModal
        selectedOice={selectedOice}
        onClose={this.handleCloseRunOiceModalRequest}
      />
    );
  }

  renderExportOiceModal(selectedOice) {
    return !!selectedOice && (
      <ExportOiceModal
        oiceId={selectedOice.id}
        storyId={selectedOice.storyId}
        onClose={this.handleCloseExportOiceModalRequest}
      />
    );
  }

  render() {
    const { storiesList, user, loading } = this.props;
    const selectedStory = this.getSelectedStory();
    const selectedOice = this.getSelectedOice();
    return (
      <div id="editor">
        <div id="editor-panel">
          {selectedStory &&
            <StorySettingModal
              mainLanguage={selectedStory.language}
            />
          }
          {this.renderRunOiceModal(selectedOice)}
          {_get(user, 'role') === USER_ROLE.ADMIN && this.renderExportOiceModal(selectedOice)}
          {this.renderToolbar(selectedOice, selectedStory)}
          {this.renderEditorPanel(selectedOice, selectedStory)}
        </div>
        {!!selectedOice && <ImportScriptModal oice={selectedOice} />}
        <StoryPicker stories={storiesList} />
        {loading && <LoadingScreen />}
      </div>
    );
  }
}
