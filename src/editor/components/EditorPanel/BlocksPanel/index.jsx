import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import update from 'immutability-helper';
import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import moment from 'moment';

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import CellMeasurer, { CellMeasurerCache } from 'react-virtualized/dist/commonjs/CellMeasurer';
import List from 'react-virtualized/dist/commonjs/List';
import 'react-virtualized/styles.css';

import _findIndex from 'lodash/findIndex';
import _get from 'lodash/get';

import * as BlockAction from 'editor/actions/block';
import * as MacroAction from 'editor/actions/macro';
import * as OiceAction from 'editor/actions/oice';
import * as StoryAction from 'editor/actions/story';
import {
  actions as StorySettingModalActions,
  constants as StorySettingModalConstants,
} from 'editor/components/EditorPanel/StorySettingModal';

import * as ItemTypes from 'editor/constants/itemType';
import { getOiceLastEditTime } from 'common/utils/editor';

import Block from './Block';
import DummyBlock from './DummyBlock';
import Switcher from './Switcher';

import './style.scss';


const BlockPlaceholder = props => (
  <div className="block loading" {...props}>
    <div className="name-placeholder" />
    <div className="content-placeholder" />
  </div>
);


@connect(store => ({
  selectedOice: store.oices.selected,
  selectedBlock: store.blocks.selectedBlock,
  selectedStory: store.stories.selected,
  selectedLanguage: store.blocks.selectedLanguage,
  supportedLanguages: store.stories.supportedLanguages,
  toBeSavedBlockLength: store.blocks.toBeSavedIds.size,
}))
@translate(['editor', 'Language'])
export default class BlocksPanel extends React.Component {
  static propTypes = {
    blockIdsArray: PropTypes.array.isRequired,
    blocksDict: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    macrosDict: PropTypes.object,
    selectedOice: PropTypes.object,
    selectedBlock: PropTypes.object,
    selectedStory: PropTypes.object,
    selectedLanguage: PropTypes.string,
    supportedLanguages: PropTypes.array,
    toBeSavedBlockLength: PropTypes.number,
  }

  constructor(props) {
    super(props);

    const {
      blockIdsArray,
      blocksDict,
      selectedBlock,
    } = this.props;

    this.state = {
      isDragging: false,
      hasNoSessionChanges: true,
      blockIdsArray,
      blocksDict,
      onSelectedBlockId: selectedBlock ? selectedBlock.id : null,
      lastSaveTime: undefined,
      movingBlockId: undefined,
    };

    this._cache = new CellMeasurerCache({
      defaultHeight: 108,
      fixedWidth: true,
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      dispatch, blockIdsArray, toBeSavedBlockLength, selectedOice,
    } = this.props;

    if (nextProps.selectedOice && selectedOice !== nextProps.selectedOice) {
      this.updateLastSaveTime(nextProps.selectedOice);
      this.startLastSaveTimer();
    }

    if (toBeSavedBlockLength !== nextProps.toBeSavedBlockLength) {
      if (nextProps.toBeSavedBlockLength > 0 && this.state.hasNoSessionChanges) {
        this.setState({ hasNoSessionChanges: false });
        this.clearLastSaveTimer();
      }
      this.resizeBlockList();
    }

    this.setState({
      blockIdsArray: nextProps.blockIdsArray || [],
      blocksDict: nextProps.blocksDict,
      onSelectedBlockId: nextProps.selectedBlock ? nextProps.selectedBlock.id : null,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { onSelectedBlockId } = this.state;
    if (onSelectedBlockId && onSelectedBlockId !== prevState.onSelectedBlockId) {
      const blockElement = findDOMNode(this[`blockComponent_${onSelectedBlockId}`]);
      if (blockElement) {
        const containerRect = this.container.getClientRects()[0];
        const rect = blockElement.getClientRects()[0];
        if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
          blockElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }
      this.handleBlockListUpdate();
    }
  }

  componentWillUnmount() {
    this.clearLastSaveTimer();
  }

  getBlockParentId = (index) => {
    const { blockIdsArray } = this.state;
    if (blockIdsArray[index - 1]) {
      return blockIdsArray[index - 1];
    }
    return 0;
  }

  handleBlockClick = (blockId, macroId) => {
    const { blocksDict } = this.state;
    this.props.dispatch(BlockAction.onSelectedBlock({ block: blocksDict[blockId] }));
  }

  handleBlockListUpdate = () => {
    if (this.blockList) {
      this.blockList.forceUpdateGrid();
    }
  }

  handleBlockMove = (dragIndex, hoverIndex) => {
    const { blockIdsArray } = this.state;
    const dragBlockId = blockIdsArray[dragIndex];
    const blockIdsArrayMoved = update(blockIdsArray, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragBlockId],
      ],
    });

    this.setState({
      blockIdsArray: blockIdsArrayMoved,
      movingBlockId: dragBlockId,
    }, this.resizeBlockList);
  }

  handleBlockDidMove = (dragBlockId) => {
    const { blockIdsArray, blocksDict } = this.state;
    const hoverIndex = blockIdsArray.findIndex(id => id === dragBlockId);
    const blockIdsArrayStore = this.props.blockIdsArray;
    const prevIndex = blockIdsArrayStore.findIndex(blockId => blockId === dragBlockId);
    if (prevIndex === hoverIndex) return;

    this.props.dispatch(BlockAction.updateBlocksFromView(blockIdsArray)); // update store here

    const parentId = blockIdsArray[hoverIndex - 1] || 0;
    this.props.dispatch(BlockAction.moveBlock(dragBlockId, parentId));
    this.setState({ movingBlockId: null }, this.handleBlockListUpdate);
  }

  handleBlockDrop = () => {
    this.setState({
      movingBlockId: null,
      isDragging: false,
    }, this.handleBlockListUpdate);
  }

  handleMacroDrop = (index, macroId) => {
    const parentId = this.getBlockParentId(index);
    const oiceId = this.props.selectedOice.id;
    const serializedBlock = {
      macroId,
      parentId,
    };
    this.props.dispatch(BlockAction.addBlock(oiceId, serializedBlock, true));
  }

  handleBlockDuplicate = (blockIndex, blockId) => {
    const oiceId = this.props.selectedOice.id;
    const block = { ...this.state.blocksDict[blockId] };
    const serializedBlock = {
      attributes: block.attributes,
      macroId: block.macroId,
      parentId: block.id,
    };
    this.props.dispatch(BlockAction.duplicateBlock(oiceId, serializedBlock));
  }

  handleOnDragging = (status) => {
    const { isDragging } = this.state;
    if (isDragging !== status) {
      this.setState({ isDragging: status });
    }
  }

  handleOpenStorySettingModalLanguageTab = () => {
    const { dispatch, selectedStory } = this.props;
    dispatch(StorySettingModalActions.toggle({
      open: true,
      story: selectedStory,
      tabBarIndex: StorySettingModalConstants.TAB_LIST.findIndex(tab =>
        tab === StorySettingModalConstants.TAB_LIST_ITEM.LANGUAGE,
      ),
    }));
  }

  handleLanguageSwitcherChange = (index) => {
    const { dispatch, selectedOice, supportedLanguages } = this.props;
    const language = supportedLanguages[index];

    // update localized blocks, oice name and story name
    dispatch(StoryAction.fetchSelectedStory(selectedOice.storyId, language));
    dispatch(OiceAction.fetchSelectedOice(selectedOice.id, language));
    dispatch(BlockAction.fetchBlocks(selectedOice.id, language));
  }

  handleOverBlock = ({ type }) => {
    if (type === ItemTypes.MACRO) {
      this._cache.clearAll();
    }
    this.resizeBlockList();
  }

  startLastSaveTimer() {
    this.clearLastSaveTimer();
    this.getLastSaveTimer = setInterval(() => {
      this.updateLastSaveTime(this.props.selectedOice);
    }, 60000);
  }

  updateLastSaveTime({ id }) {
    const lastSaveTime = getOiceLastEditTime(id);
    if (lastSaveTime) {
      this.setState({ lastSaveTime });
    }
  }

  clearLastSaveTimer() {
    if (this.getLastSaveTimer) {
      clearInterval(this.getLastSaveTimer);
      this.getLastSaveTimer = undefined;
    }
  }

  rowRenderer = ({
    key, index, style, isVisible, isScrolling, parent,
  }) => {
    const { t, blocksDict, macrosDict } = this.props;
    const { isDragging, blockIdsArray } = this.state;
    const lastIndex = blockIdsArray.length;

    if (index === blockIdsArray.length) {
      return (
        <DummyBlock
          disabled={isDragging}
          index={lastIndex}
          style={style}
          onDropMacro={this.handleMacroDrop}
        />
      );
    }

    const block = blocksDict[blockIdsArray[index]];
    const { macroId } = block;
    const macro = macrosDict[macroId];

    if (!isVisible && isScrolling) {
      return <BlockPlaceholder style={style} />;
    }

    return (
      <CellMeasurer
        key={key}
        cache={this._cache}
        columnIndex={0}
        minHeight={108}
        parent={parent}
        rowIndex={index}
      >
        <Block
          ref={ref => this[`blockComponent_${block.id}`] = ref}
          index={index}
          block={block}
          moveBlock={this.handleBlockMove}
          didMoveBlock={this.handleBlockDidMove}
          toBeAddBlock={this.toBeAddBlock}
          isSelected={this.state.onSelectedBlockId === block.id}
          macroColor={macro.groupColor}
          macroIcon={macro.icon}
          style={style}
          blockList={this.getRefList}
          movingBlockId={this.state.movingBlockId}
          onDragging={this.handleOnDragging}
          onDropBlock={this.handleBlockDrop}
          onDropMacro={this.handleMacroDrop}
          onDuplicate={this.handleBlockDuplicate}
          onOverBlock={this.handleOverBlock}
          onClick={() => this.handleBlockClick(block.id, macroId)}
        />
      </CellMeasurer>
    );
  }

  resizeBlockList = () => {
    this._cache.clearAll();
    if (this.blockList) {
      this.blockList.recomputeRowHeights();
    }
  }

  renderBlocksList(blockIdsArray) {
    // it is uncertain for whether have components so findDOMNode get undefined when call in componentDidMount
    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={ref => this.blockList = ref}
            height={height}
            rowCount={blockIdsArray.length + 1}
            rowHeight={this._cache.rowHeight}
            rowRenderer={this.rowRenderer}
            width={width}
          />
        )}
      </AutoSizer>
    );
  }

  renderLastSaveTime() {
    const { t, toBeSavedBlockLength } = this.props;
    const { hasNoSessionChanges, lastSaveTime } = this.state;
    return (
      <div className="last-edit-time">
        {/* show when currently no changes are made in editor */}
        {lastSaveTime && hasNoSessionChanges && toBeSavedBlockLength === 0 && (
          <span>
            {`${t('blocksList.statusRow.lastSave', {
              time: moment(lastSaveTime).fromNow(),
            })}`}
          </span>
        )}
        {/* show when any changes are made and saved */}
        {!hasNoSessionChanges && toBeSavedBlockLength === 0 && (
          <span>{t('blocksList.statusRow.allChangesSaved')}</span>
        )}
        {/* show when toBeSavedBlocks' size is non-zero */}
        {toBeSavedBlockLength > 0 && (
          <span>{t('blocksList.statusRow.saving')}</span>
        )}
      </div>
    );
  }

  render() {
    const {
      t,
      macrosDict,
      selectedOice,
      selectedStory,
      selectedLanguage,
      supportedLanguages,
    } = this.props;
    const { blockIdsArray, blocksDict } = this.state;
    if (!selectedOice || !supportedLanguages) return null;
    const languageIndex = supportedLanguages.findIndex(language =>
      language === selectedLanguage || 0
    );

    return (
      <div ref={ref => this.container = ref} id="blocks-panel">
        <div className="editor-status-bar">
          {this.renderLastSaveTime()}
          <div className="block-language-switcher">
            <Switcher
              actionTitle={t('blocksList.statusRow.otherLanguage')}
              label={t('blocksList.statusRow.editing')}
              selectedIndex={languageIndex}
              values={supportedLanguages.map(t)}
              onClickAction={this.handleOpenStorySettingModalLanguageTab}
              onChange={this.handleLanguageSwitcherChange}
            />
          </div>
        </div>
        <div className="block-list">
          {macrosDict && this.renderBlocksList(blockIdsArray)}
        </div>
      </div>
    );
  }
}
