import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { translate } from 'react-i18next';
import { DragSource, DropTarget } from 'react-dnd';

import _get from 'lodash/get';
import _mapKeys from 'lodash/mapKeys';
import classNames from 'classnames';

import * as ItemTypes from 'editor/constants/itemType';
import { macroColors } from 'editor/constants/macro';
import * as BlockAction from 'editor/actions/block';

import TriangleLabel from 'ui-elements/TriangleLabel';
import FlatButton from 'ui-elements/FlatButton';

import CloseIcon from 'common/icons/close';
import DuplicateIcon from 'common/icons/duplicate';

import { DOMAIN_URL } from 'common/constants';

import OptionBlock from './BlockContent/OptionBlock';
import { DummyBlock } from './DummyBlock';


const blockSource = {
  beginDrag(props) {
    props.onDragging(true);
    return {
      type: 'block',
      id: props.block.id,
      index: props.index,
      macroId: props.block.macroId,
    };
  },
  endDrag(props, monitor, component) {
    props.onDragging(false);
    // call didMoveBlock when moved; done checking in index file
    const hoverIndex = props.index;
    props.didMoveBlock(hoverIndex);
  },
};

const blockTarget = {
  drop(props, monitor, component) {
    // only execute here when really did drop
    const hoverIndex = props.index;
    const dragItem = monitor.getItem();
    const dragIndex = dragItem.index; // block

    const macroId = dragItem.macroId;
    const blockId = dragItem.id;
    // dragItem is the object get for beginDrag in Macro Component
    // props here can just get the props from parent but not redux
    if (dragItem.type === 'macro') {
      props.onDropMacro(hoverIndex, macroId);
    }

    // could return message to drage source
    return {
      didDrop: true,
    };
  },

  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const dragSourceType = monitor.getItem().type;
    const hoverIndex = props.index;

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    switch (dragSourceType) {
      case 'block':
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
          return;
        }
        props.moveBlock(dragIndex, hoverIndex);
        /* eslint no-param-reassign: 0 */
        monitor.getItem().index = hoverIndex;
        break;

      default:
        break;
    }
  },
};

const getThumbnailImageURL = (attribute) => {
  let imageURL = '';
  if (attribute && attribute.asset.types) {
    const type = attribute.asset.types[0].type;
    if (type === 'image') {
      imageURL = `${DOMAIN_URL}${attribute.asset.url}`;
    }
  }
  return imageURL;
};

const convertPropsToState = (props) => {
  const { block } = props;
  if (block.attributes) {
    const attributes = _mapKeys(block.attributes, (value, key) => value.definition.type);
    return {
      attributes,
      backgroundImage: getThumbnailImageURL(attributes.reference),
    };
  }
  return null;
};


@DropTarget([ItemTypes.BLOCK, ItemTypes.MACRO], blockTarget, (connectDnD, monitor) => ({
  connectDropTarget: connectDnD.dropTarget(),
  isOver: monitor.isOver(),
  dragItemType: monitor.getItem(),
}))
@DragSource(ItemTypes.BLOCK, blockSource, (connectDnD, monitor) => ({
  connectDragSource: connectDnD.dragSource(),
  isDragging: monitor.isDragging(),
}))
@translate(['macro'])
@connect(store => ({
  selectedOiceId: store.oices.selectedId,
  characterDictionary: store.stories.characterDictionary,
}))
export default class Block extends React.Component {
  static propTypes = {
    block: PropTypes.object.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    isOver: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    characterDictionary: PropTypes.object,
    dragItemType: PropTypes.any,
    macroColor: PropTypes.string,
    macroIcon: PropTypes.any,
    showDeleteBtn: PropTypes.bool,
    onClick: PropTypes.func,
    onDuplicate: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = convertPropsToState(props);
    this.state.hover = false;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(convertPropsToState(nextProps));
  }

  handleDuplicateButtonClick = (index, id) => {
    if (this.props.onDuplicate) this.props.onDuplicate(index, id);
  }

  handleDeleteButtonClick = (id) => {
    this.props.dispatch(BlockAction.deleteBlock(id));
  }

  handleClick = () => {
    this.props.onClick();
  }

  handleMouseOver = () => {
    this.setState({ hover: true });
  }

  handleMouseOut = () => {
    this.setState({ hover: false });
  }

  renderBlockContent(attributes) {
    const { block } = this.props;
    switch (block.macroName) {
      case 'bgm':
      case 'playse':
      case 'bg':
      case 'item': {
        const { reference } = attributes;
        return (
          <div className="title-block">
            {reference && reference.asset ? reference.asset.nameEn : ''}
          </div>
        );
      }
      case 'addTalk':
      case 'aside':
      case 'characterdialog': {
        let character;
        if (block.macroName === 'characterdialog' && attributes.character) {
          const characterId = attributes.character.value;
          character = this.props.characterDictionary[characterId];
        }

        const isGeneric = _get(character, 'isGeneric', false);
        const name = (
          block.macroName === 'aside' || isGeneric ?
          _get(block, 'attributes.name.value') :
          _get(character, 'name')
        );

        return (
          <div>
            {!!name &&
              <div className="title-block">
                {name}
              </div>
            }
            {!!attributes.paragraph &&
              <div className="content-block">
                {attributes.paragraph.value}
              </div>
            }
          </div>
        );
      }
      case 'label':
        return (
          <div className="content-block">
            {
              _get(block, 'attributes.caption.value', '') ||
              _get(block, 'attributes.name.value', '')
            }
          </div>
        );
      case 'option':
        return <OptionBlock attributes={block.attributes} />;
      case 'comment':
        return (
          <div className="content-block">
            {_get(block, 'attributes.text.value', '')}
          </div>
        );
      case 'jump':
        return (
          <div className="content-block">
            {_get(block, 'attributes.target.value', '')}
          </div>
        );
      default:
        return <div />;
    }
  }

  render() {
    const {
      block,
      connectDragSource,
      connectDropTarget,
      index,
      isDragging,
      isOver,
      dragItemType,
      macroColor,
      macroIcon,
      showDeleteBtn,
      t,
    } = this.props;
    const { backgroundImage, attributes } = this.state;

    const triangleLabel = (icon, selected) => (
      <TriangleLabel
        icon={React.createElement(icon)}
        selected={selected}
        selectedColor={selected ? macroColors[macroColor] : '#D8D8D8'}
      />
    );

    const containerClassName = classNames('block-container', {
      hover: isOver,
    });

    const blockClassName = classNames('block', {
      selected: showDeleteBtn,
    });
    // change blocks oreder case
    if (isDragging) {
      return connectDropTarget(<div><DummyBlock hover /></div>);
    }

    const isShowSeparator = /(label|bg)/.test(block.macroName);

    return connectDragSource(connectDropTarget(
      <div
        className={containerClassName}
        id={`block-${block.id}`}
        onClick={this.handleClick}
        onMouseOut={this.handleMouseOut}
        onMouseOver={this.handleMouseOver}
      >
        {isOver && dragItemType && dragItemType.type === 'macro' && <DummyBlock hover />}
        {isShowSeparator && <div className="separator" />}
        <div className={blockClassName}>
          {macroIcon && triangleLabel(macroIcon, showDeleteBtn)}
          <div className="block-info">
            {`${index + 1} #${block.id}`}
          </div>
          <div
            className="block-detail"
            style={{ color: macroColors[macroColor] }}
          >
            <div
              className="block-image"
              style={{ backgroundImage: `url('${backgroundImage}')` }}
            />
            <div>
              <span>{t(`${block.macroName}._title`)}</span>
              <div
                className="block-buttons"
                style={{ display: showDeleteBtn || this.state.hover ? 'inline' : 'none' }}
              >
                <FlatButton
                  icon={<DuplicateIcon />}
                  onClick={() => this.handleDuplicateButtonClick(index, block.id)}
                />
                <FlatButton
                  icon={<CloseIcon />}
                  onClick={() => this.handleDeleteButtonClick(block.id)}
                />
              </div>
              <div className="block-content">
                {this.renderBlockContent(attributes)}
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }
}
