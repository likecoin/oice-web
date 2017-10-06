import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import _get from 'lodash/get';

import * as ItemTypes from 'editor/constants/itemType';
import { macroColors } from 'editor/constants/macro';
import * as BlockAction from 'editor/actions/block';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';


const getTutorialStepIdsFromDragMacro = (macroId) => {
  switch (macroId) {
    case 78: return ['72ca1a4'];
    default: return null;
  }
};

const getTutorialStepIdsFromDidNotDropMacro = (macroId) => {
  switch (macroId) {
    case 78: return ['72ca1a2'];
    default: return null;
  }
};

const blockSource = {
  beginDrag(props) {
    props.dispatch(InteractiveTutorial.Action.achieve(
      getTutorialStepIdsFromDragMacro(props.macro.id)
    ));
    return {
      type: 'macro',
      macroId: props.macro.id,
    };
  },
  endDrag(props, monitor) {
    const didDrop = monitor.didDrop();
    if (!didDrop) {
      props.dispatch(InteractiveTutorial.Action.revert(
        getTutorialStepIdsFromDidNotDropMacro(props.macro.id)
      ));
    }
  },
};

@connect(store => ({
  blockIdsArray: store.blocks.idsArray,
  selectedBlock: store.blocks.selectedBlock,
  selectedOiceId: store.oices.selected ? store.oices.selected.id : null,
}))
@DragSource(ItemTypes.MACRO, blockSource, (connectDnD, monitor) => ({
  connectDragSource: connectDnD.dragSource(),
}))
@translate(['macro'])
export default class Macro extends React.Component {
  static propTypes = {
    blockIdsArray: PropTypes.array.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    macro: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    selectedBlock: PropTypes.object,
    selectedOiceId: PropTypes.number,
  };

  handleDoubleClick = () => {
    const {
      blockIdsArray,
      dispatch,
      macro,
      selectedBlock,
      selectedOiceId,
      t,
    } = this.props;
    if (selectedOiceId) {
      const lastBlockId = blockIdsArray[(blockIdsArray.length - 1)] || 0;
      const parentBlockId = _get(selectedBlock, 'id', lastBlockId);
      const serializedBlock = {
        macroId: macro.id,
        parentId: parentBlockId,
      };
      dispatch(InteractiveTutorial.Action.achieve(
        getTutorialStepIdsFromDragMacro(macro.id)
      ));
      dispatch(
        BlockAction.addBlock(selectedOiceId, serializedBlock, false)
      );
    }
  }

  render() {
    const { t, macro, connectDragSource } = this.props;
    const { groupColor, icon } = macro;
    const Icon = React.createElement(icon);
    return connectDragSource(
      <div
        className="macro"
        id={`macro-${macro.id}`}
        style={{ backgroundColor: macroColors[groupColor] }}
        onDoubleClick={this.handleDoubleClick}
      >
        <span className="macro-icon">{Icon}</span>
        <span className="macro-label">{t(`${macro.name}._title`)}</span>
      </div>
    );
  }
}
