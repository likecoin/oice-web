import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import GalleryItem from './GalleryItem';
import GalleryExpansionPanel from './GalleryExpansionPanel';

import './styles.scss';

export default class Gallery extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['story', 'library']).isRequired,
    className: PropTypes.string,
    columnWidth: PropTypes.number,
    columns: PropTypes.number,
    emptyChild: PropTypes.node,
    expandedChild: PropTypes.node,
    galleryExpansionPanelHeight: PropTypes.number,
    items: PropTypes.array,
    newItemTitleString: PropTypes.string,
    getLink: PropTypes.func,
    onSelect: PropTypes.func,
    onSelectAddItem: PropTypes.func,
    onSelectionCheck: PropTypes.func,
  }

  static defaultProps = {
    columnWidth: 170,
    items: [],
  }

  getLink = item => this.props.getLink(this.props.type, item);

  handleItemClick = (item) => {
    const { type, onSelect } = this.props;
    if (onSelect) onSelect(type, item);
  }

  render() {
    const {
      columns,
      columnWidth,
      emptyChild,
      expandedChild,
      galleryExpansionPanelHeight,
      getLink,
      items,
      newItemTitleString,
      onSelectAddItem,
      onSelectionCheck,
      type,
    } = this.props;

    const className = classNames(
      'user-portfolio-gallery-tab',
      type,
      this.props.className,
    );

    const children = [];
    const addItemCount = onSelectAddItem ? 1 : 0;
    const groupCount = Math.max(Math.ceil((items.length + addItemCount) / columns), 1);
    const itemStyle = {
      width: `${columnWidth}px`,
    };

    let startIndex = 0;
    let endIndex = startIndex + columns;
    for (let i = 0; i < groupCount; i++) {
      const itemChildren = [];
      let detailItem;
      if (onSelectAddItem && i === 0) {
        itemChildren.push(
          <GalleryItem.Add
            key={'-1-1'}
            newItemTitleString={newItemTitleString}
            style={itemStyle}
            onClick={onSelectAddItem}
          />
        );
        endIndex -= 1;
      }
      for (let j = startIndex; j < endIndex; j++) {
        const item = items[j];
        if (item) {
          const selected = onSelectionCheck && onSelectionCheck(type, item);
          if (selected) {
            detailItem = item;
          }
          itemChildren.push(
            <GalleryItem
              key={item.id}
              item={item}
              getLink={getLink && this.getLink}
              selected={selected}
              style={itemStyle}
              onClick={this.handleItemClick}
            />
          );
        } else {
          itemChildren.push(
            <GalleryItem.Dummy key={`{${i}${j}}`} style={itemStyle} />
          );
        }
      }
      startIndex = endIndex;
      endIndex += columns;

      children.push(
        <div
          key={`${i}-group`}
          className="user-portfolio-gallery-item-group"
        >
          {itemChildren}
        </div>
      );

      const isExpanded = detailItem !== undefined;
      children.push(
        <GalleryExpansionPanel
          key={`${i}-details`}
          expanded={isExpanded}
          height={galleryExpansionPanelHeight}
        >
          {isExpanded && expandedChild}
        </GalleryExpansionPanel>
      );
    }

    return (
      <ul ref={ref => this.container = ref} className={className}>
        {children}
        {items.length === 0 &&
          <div className="empty-wrapper">
            {emptyChild}
          </div>
        }
      </ul>
    );
  }
}
