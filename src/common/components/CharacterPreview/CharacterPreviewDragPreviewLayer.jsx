import React from 'react';
import PropTypes from 'prop-types';
import { DragLayer } from 'react-dnd';

import classNames from 'classnames';
import _get from 'lodash/get';

import CoordinateLabel from './CoordinateLabel';


@DragLayer(monitor => ({
  currentOffset: monitor.getSourceClientOffset(),
}))
export default class CharacterPreviewDragPreviewLayer extends React.Component {
  static propTypes = {
    currentOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    ratio: PropTypes.number,
    children: PropTypes.node,
  };

  static defaultProps = {
    currentOffset: undefined,
    ratio: 1,
    children: undefined,
  }

  shouldComponentUpdate(nextProps) {
    const { currentOffset } = this.props;

    const currentX = _get(currentOffset, 'x');
    const currentY = _get(currentOffset, 'y');

    const nextX = _get(nextProps, 'currentOffset.x');
    const nextY = _get(nextProps, 'currentOffset.y');

    return currentX !== nextX || currentY !== nextY;
  }

  renderDragPreview() {
    const { currentOffset, children } = this.props;

    if (!currentOffset || !this.container) {
      return null;
    }

    const { x, y } = currentOffset;
    const { left, top } = this.container.getClientRects()[0];

    const transform = `translate(${x - left}px, ${y - top}px)`;
    const style = {
      transform,
      WebkitTransform: transform,
    };

    return (
      <div style={style}>
        {children}
      </div>
    );
  }

  renderCoordinateLabel() {
    const { currentOffset, ratio } = this.props;

    if (!currentOffset || !this.container) {
      return null;
    }

    let { x, y } = currentOffset;
    const { left, top } = this.container.getClientRects()[0];

    x = Math.round((x - left) / ratio);
    y = Math.round((y - top) / ratio);

    return (
      <CoordinateLabel x={x} y={y} />
    );
  }

  render() {
    return (
      <div ref={ref => this.container = ref} className="character-preview-drag-preview-layer">
        {this.renderDragPreview()}
        {this.renderCoordinateLabel()}
      </div>
    );
  }
}
