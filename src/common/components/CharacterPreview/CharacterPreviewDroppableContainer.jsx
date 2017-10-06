import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';

import { ITEM_TYPE, OICE_SIZE } from './CharacterPreview.constants';

import CoordinateLabel from './CoordinateLabel';


const characterPreviewImageDroppableContainerTarget = {
  drop(props, monitor, component) {
    const item = monitor.getItem();
    const delta = monitor.getDifferenceFromInitialOffset();
    const x = item.x + delta.x;
    const y = item.y + delta.y;
    component.handleDrop(x, y);
  },
};

@DropTarget(ITEM_TYPE, characterPreviewImageDroppableContainerTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
export default class CharacterPreviewDroppableContainer extends React.Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    children: PropTypes.node,
    onDrop: PropTypes.func,
  };

  static defaultProps = {
    children: undefined,
    onDrop: undefined,
  };

  handleDrop(x, y) {
    if (this.props.onDrop) {
      this.props.onDrop(x, y);
    }
  }

  render() {
    const { connectDropTarget, children } = this.props;

    return connectDropTarget(
      <div className="character-preview-droppable-container">
        <hr className="guideline horizontal golden div-1-3" />
        <hr className="guideline horizontal golden div-2-3" />
        <hr className="guideline vertical golden div-1-3" />
        <hr className="guideline vertical golden div-2-3" />
        <CoordinateLabel x={0} y={0} top left />
        <CoordinateLabel x={OICE_SIZE} y={OICE_SIZE} bottom right />
        {children}
      </div>
    );
  }
}
