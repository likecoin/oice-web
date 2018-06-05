import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import classNames from 'classnames';

import { shouldPureComponentUpdate } from 'common/utils';

import { ITEM_TYPE } from './CharacterPreview.constants';

import CharacterPreviewImage from './CharacterPreviewImage';


const boxSource = {
  beginDrag(props) {
    const { x, y } = props;
    return { x, y };
  },
  canDrag(props) {
    return !props.readonly;
  },
};

@DragSource(ITEM_TYPE, boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export default class CharacterPreviewDraggableItem extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    children: PropTypes.node,
    x: PropTypes.number,
    y: PropTypes.number,
  };

  static defaultProps = {
    children: undefined,
    x: 0,
    y: 0,
  }

  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  render() {
    const {
      connectDragSource, isDragging, children, x, y,
    } = this.props;

    const className = classNames('character-preview-draggable-item');

    const transform = `translate3d(${x}px, ${y}px, 0)`;
    const style = {
      transform,
      WebkitTransform: transform,
      // IE fallback: hide the real node using CSS when dragging
      // because IE will ignore our custom "empty image" drag preview.
      opacity: isDragging ? 0 : 1,
      height: isDragging ? 0 : '',
    };

    return connectDragSource(
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
}
