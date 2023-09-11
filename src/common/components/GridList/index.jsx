import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './style.scss';

export default class GridList extends React.Component {
  static defaultProps = {
    interSpace: 15,
  }

  static propTypes = {
    elementWidth: PropTypes.number.isRequired,
    children: PropTypes.arrayOf(PropTypes.node),
    elementHeight: PropTypes.number,
    id: PropTypes.string,
    interSpace: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      containerMargin: 0,
    };
    this.elements = [];
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateLayout);
    this.updateLayout();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateLayout);
  }

  updateLayout = () => {
    const { props, state, component } = this;
    const { elementWidth, interSpace } = props;
    const cellWidth = elementWidth + interSpace;
    const containerWidth = component.offsetWidth;
    const numberOfCellsPerRow = Math.floor(containerWidth / cellWidth);
    const containerMargin = (containerWidth - (cellWidth * numberOfCellsPerRow)) / 2;

    this.setState({ containerMargin });
  }

  createGridTile(element, index) {
    const { elementWidth, elementHeight, interSpace } = this.props;
    const style = {
      margin: `${interSpace / 2}px`,
      ...element.props.style,
      width: elementWidth,
      height: elementHeight,
    };
    return React.cloneElement(element, {
      key: index,
      index,
      style,
      ref: (e) => { this.elements.push(e); },
    });
  }

  render() {
    const { interSpace, children, id } = this.props;
    const { containerMargin } = this.state;
    const cells = [];

    React.Children.forEach(children, (child, index) => {
      if (React.isValidElement(child) && (child.type.displayName === 'Card')) {
        cells.push(this.createGridTile(child, index));
      } else {
        console.warn('Invalid child %o', child);
      }
    });

    return (
      <div
        ref={(e) => { this.component = e; }}
        className="grid-list"
        {... { id }}
      >
        <div
          ref={ref => this.gridCellsContainer = ref}
          className="grid-cells-container"
          style={{
            margin: `-${interSpace / 2}px`,
            marginLeft: containerMargin,
            marginRight: containerMargin,
          }}
        >
          {cells}
        </div>
      </div>
    );
  }
}
