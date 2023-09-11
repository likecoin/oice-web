import React from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import classNames from 'classnames';
import { getDisplayTime } from 'editor/utils/datetime.js';

import DragHandleIcon from 'common/icons/move';

const boxSource = {
  beginDrag(props) {
    return {
      id: props.oice.id,
      index: props.index,
    };
  },
};

const blockTarget = {
  drop(props, monitor, component) {
    // only execute here when really did drop
    const hoverIndex = props.index;
    const dragItem = monitor.getItem();
    const dragIndex = dragItem.index; // block

    props.onDrag(dragIndex, hoverIndex);
  },
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const dragSourceType = monitor.getItem().type;
    const hoverIndex = props.index;
    // console.log('hover index', hoverIndex);
    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      // no op
    }
  },
};


@DropTarget('BOX', blockTarget, (connectDnD, monitor) => ({
  connectDropTarget: connectDnD.dropTarget(),
  isOver: monitor.isOver(),
}))
@DragSource('BOX', boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export default class OiceBlock extends React.Component {
  static propTypes = {
    connectDragPreview: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    oice: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    onRequestCopy: PropTypes.func,
    onSelect: PropTypes.func,
  };

  handleSelect = (index) => {
    if (this.props.onSelect) this.props.onSelect(index);
  }

  handleCopyButtonClick = (oice, index) => {
    const { onRequestCopy } = this.props;
    if (onRequestCopy) onRequestCopy(oice, index);
  }

  render() {
    const {
      isDragging,
      connectDragSource,
      connectDragPreview,
      connectDropTarget,
    } = this.props;
    const { oice, index, t } = this.props;
    const oiceRowClassName = classNames('oice-row clickable', {
      dragging: isDragging,
    });

    return connectDropTarget(
      <div id={`oice-${oice.id}`}>
        <div className="episode-row">
          {t('oicesList.episode', { number: index + 1 })}
        </div>
        {connectDragPreview(
          <div
            className={oiceRowClassName}
            onClick={() => this.handleSelect(index)}
          >
            {connectDragSource(
              <div className="oice-drag-handle">
                <DragHandleIcon />
              </div>
            )}
            <div className="oice-publish-indicator" />
            <div className="oice-name">
              {oice.name}
            </div>
            <div className="oice-last-modified-time">
              {getDisplayTime(oice.updatedAt)}
            </div>
          </div>
        )}
      </div>
    );
  }
}
