import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push, replace } from 'react-router-redux';
import { translate } from 'react-i18next';
import { findDOMNode } from 'react-dom';

import SwipeableViews from 'react-swipeable-views';

import uuid from 'uuid';

import _get from 'lodash/get';

import FlatButton from 'ui-elements/FlatButton';
import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import Footer from 'common/components/Footer';

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

import Dashboard from '../Dashboard';
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

@translate(['editor', 'macro'])
@connect(store => ({
  blockIdsToBeSaved: store.blocks.toBeSavedIds,
  blocksDict: store.blocks.blocksDict,
  dashboardOices: store.editorPanel.dashboard.oices,
  imageList: store.assets.imageList,
  isAddingOice: store.editorPanel.dashboard.isAddingOice,
  isAddingStory: store.editorPanel.dashboard.isAddingStory,
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
    oicesList: PropTypes.array.isRequired,
    storiesList: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    dashboardOices: PropTypes.array,
    isAddingOice: PropTypes.bool,
    isAddingStory: PropTypes.bool,
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

  constructor(props) {
    super(props);
    this.state = {
      isAddingOice: props.isAddingOice,
      isAddingStory: props.isAddingStory,
    };
  }

  getChildContext() {
    return { module: 'editor' };
  }

  componentDidMount() {
    const storyId = this.getStoryId();
    const oiceId = this.getOiceId();
    const { dispatch, dashboardOices, selectedStoryId } = this.props;
    const { isAddingOice, isAddingStory } = this.state;

    if (storyId) {
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

  getStoryId() {
    return parseInt(this.props.params.storyId, 10);
  }

  getOiceId() {
    return parseInt(this.props.params.oiceId, 10);
  }

  getSelectedStory = (id = null) => {
    const storyId = id || this.getStoryId();
    const storiesList = this.props.storiesList;
    // default get from the storiesList, if localized will store in selectedStory
    return this.props.selectedStory || storiesList.find(story => story.id === parseInt(storyId, 10));
  }

  getSelectedOice = () => {
    const { oicesList, params, selectedOice } = this.props;
    const { oiceId } = params;
    // default get from the oicesList, if localized will store in selectedOice
    return selectedOice || oicesList.find(oice => oice.id === parseInt(oiceId, 10));
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

  handleCopyOiceRequest = (oice) => {
    const { dispatch, t } = this.props;
    dispatch(StoryPicker.Action.open({
      selectedId: oice.storyId,
      onSelect: (storyId) => {
        console.debug('handleCopyOiceRequest', storyId);
      },
      description: t('oicesList.label.pickAStoryForCopyOice'),
    }));
    if (this.getStoryId() !== oice.storyId) {
      this.props.dispatch(CharacterAction.fetchCharacter(oice.storyId));
      this.props.dispatch(AssetAction.fetchStoryAssetList(oice.storyId));
    }
    this.setState({ isStoryOiceModelOpen: false });
  }

  handleRunOiceButtonClick = (selectedOice, blocksToBeSaved, isPreview) => {
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
        blocksToBeSaved,
        isPreview,
        jobId,
      ));
    }
  }

  handleExportOiceButtonClick = (selectedOice, blocksToBeSavedArray) => {
    if (selectedOice) {
      const jobId = getBuildId();
      this.props.dispatch(ExportOiceModal.Action.open({
        id: jobId,
      }));
      this.props.dispatch(OiceAction.exportOice(
        selectedOice.storyId,
        selectedOice.id,
        blocksToBeSavedArray,
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
      const { isAddingOice, isAddingStory } = this.state;
      return (
        <EmptyEditorWorkspace
          t={t}
          onLoad={() => {
            if (
              !user.isFirstLogin &&
              !(isAddingOice || isAddingStory) &&
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
    const { blockIdsToBeSaved, blocksDict, t, user } = this.props;
    const blocksToBeSaved = getComposedToBeSavedBlocks(blockIdsToBeSaved, blocksDict);
    const blockIdsArray = [...blockIdsToBeSaved]; // convert set to array
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
        oiceName={selectedOice && selectedOice.name}
        storyName={selectedStory && selectedStory.name}
        user={user}
        onClickAssetManagement={this.handleAssetsMangementButtonClick}
        onClickExportOice={() => this.handleExportOiceButtonClick(
          selectedOice, blocksToBeSaved
        )}
        onClickImportButton={this.handleRequestOpenImportScriptModal}
        onClickOiceSetting={() => this.handleOpenStorySetting(TAB_LIST_ITEM.OICE)}
        onClickRunOice={() => this.handleRunOiceButtonClick(
          selectedOice, blocksToBeSaved, false
        )}
        onClickStorySetting={() => this.handleOpenStorySetting(TAB_LIST_ITEM.STORY)}
        onPreviewOiceButtonClick={() => this.handleRunOiceButtonClick(
          selectedOice, blocksToBeSaved, true
        )}
      />
    );
  }

  renderRunOiceModal(selectedOice) {
    return selectedOice && (
      <RunOiceModal
        selectedOice={selectedOice}
        onClose={this.handleCloseRunOiceModalRequest}
      />
    );
  }

  renderExportOiceModal(selectedOice) {
    return selectedOice && (
      <ExportOiceModal
        oiceId={selectedOice.id}
        storyId={selectedOice.storyId}
        onClose={this.handleCloseExportOiceModalRequest}
      />
    );
  }

  render() {
    const { storiesList, user } = this.props;
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
        {selectedOice && <ImportScriptModal oice={selectedOice} />}
        <StoryPicker stories={storiesList} />
        <Footer fluid />
      </div>
    );
  }
}
