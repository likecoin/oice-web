import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import LoadingScreen from 'ui-elements/LoadingScreen';

import * as OiceAction from 'editor/actions/oice';
import * as BlockAction from 'editor/actions/block';
import * as AssetAction from 'editor/actions/asset';
import * as LibraryAction from 'editor/actions/library';
import * as StoryAction from 'editor/actions/story';

import BlocksPanel from './BlocksPanel';
import MacrosPanel from './MacrosPanel';
import AttributesPanel from './AttributesPanel';

import { getComposedToBeSavedBlocks } from './util';
import RecentUsed from './RecentUsed';


@connect(store => ({
  loading: store.assets.loading || store.blocks.fetching || store.characters.loading,
  blockIdsArray: store.blocks.idsArray,
  blockIdsToBeSaved: store.blocks.toBeSavedIds,
  blocksDict: store.blocks.blocksDict,
  macros: store.macros.list,
  macrosDict: store.macros.dict,
}))
export default class EditorWorkspace extends React.Component {
  static propTypes = {
    blockIdsArray: PropTypes.array.isRequired,
    blockIdsToBeSaved: PropTypes.any.isRequired,
    blocksDict: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    macros: PropTypes.array.isRequired,
    oice: PropTypes.object.isRequired,
    story: PropTypes.object.isRequired,
    macrosDict: PropTypes.object,
  }

  componentDidMount() {
    this.loadWorkspace(this.props);
    // timer
    this.autoSaveTimer = setInterval(() => {
      const { blockIdsToBeSaved, blocksDict } = this.props;
      const blocksToBeSavedArray = getComposedToBeSavedBlocks(blockIdsToBeSaved, blocksDict);
      const blockIdsArray = [...blockIdsToBeSaved]; // convert set to array
      if (blockIdsToBeSaved.size > 0) {
        this.props.dispatch(BlockAction.saveBlocks(blocksToBeSavedArray, blockIdsArray));
      }
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.oice.id !== nextProps.oice.id) this.loadWorkspace(nextProps);
  }

  componentWillUnmount() {
    clearInterval(this.autoSaveTimer);
  }

  loadWorkspace(props) {
    const { oice, story } = props;
    props.dispatch(OiceAction.selectOice(oice));
    props.dispatch(StoryAction.selectStory(story));
    props.dispatch(BlockAction.fetchBlocks(oice.id, oice.language));
    props.dispatch(RecentUsed.Actions.initialize(oice.storyId));
  }

  render() {
    const {
      blockIdsArray,
      blocksDict,
      macros,
      macrosDict,
      loading,
    } = this.props;

    return (
      <div id="editor-workspace">
        <MacrosPanel macros={macros} />
        <BlocksPanel
          blockIdsArray={blockIdsArray}
          blocksDict={blocksDict}
          macrosDict={macrosDict}
        />
        <AttributesPanel />
        {loading && <LoadingScreen />}
      </div>
    );
  }
}
