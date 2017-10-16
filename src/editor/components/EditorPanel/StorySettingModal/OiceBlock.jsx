import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';
import { DragSource, DropTarget } from 'react-dnd';

import classNames from 'classnames';
import _get from 'lodash/get';
import _throttle from 'lodash/throttle';

import AlertDialog from 'ui-elements/AlertDialog';
import FlatButton from 'ui-elements/FlatButton';
import TextField from 'ui-elements/TextField';
import ToggleButton from 'ui-elements/ToggleButton';

import DeleteIcon from 'common/icons/rubbish-bin-2';
import DragHandleIcon from 'common/icons/drag';
import EditIcon from 'common/icons/edit-2';

import * as OiceAction from 'editor/actions/oice';
import * as Actions from './StorySettingModal.actions';

import WordCount from './WordCount';
import { WORD_COUNT_WAIT_TIME_MS } from './StorySettingModal.constants';


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
      return;
    }
    props.onDrag(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
    /* eslint no-param-reassign: 0 */
  },
};


@DropTarget('BOX', blockTarget, (connectDnD, monitor) => ({
  connectDropTarget: connectDnD.dropTarget(),
  isOver: monitor.isOver(),
}))
@DragSource('BOX', boxSource, (connectDnD, monitor) => ({
  connectDragSource: connectDnD.dragSource(),
  connectDragPreview: connectDnD.dragPreview(),
  isDragging: monitor.isDragging(),
}))
@connect()
@translate(['OiceSettingTab', 'editor'])
export default class OiceBlock extends React.Component {
  static propTypes = {
    connectDragPreview: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    oice: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    onDeleteOice: PropTypes.func,
    onSaveName: PropTypes.func,
    onSelectRow: PropTypes.func,
    onToggleSharingOption: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      isEditingOiceName: false,
      name: undefined,
      isHovering: false,
    };
  }

  componentDidMount() {
    this._fetchWordCountThrottle = _throttle(
      ({ dispatch, oice, index }) => {
        dispatch(Actions.fetchOiceWordCount(oice, index));
      },
      WORD_COUNT_WAIT_TIME_MS,
      {
        leading: false, // do not invoke on the leading edge of the timeout
      },
    );
  }

  handleClickEditOiceNameButton = () => {
    const isEditingOiceName = true;
    this.setState({
      name: this.props.oice.name,
      isEditingOiceName,
    });
    this.toggleClickOutsideListener(isEditingOiceName);
  }

  handleSaveOiceName = () => {
    const { name } = this.state;

    if (!name) {
      this.props.dispatch(AlertDialog.toggle({
        body: this.props.t('placeholder.name'),
      }));
      return;
    }

    const { onSaveName, oice } = this.props;
    if (onSaveName) {
      onSaveName({
        oiceId: oice.id,
        oiceName: name,
      });
    }
    const isEditingOiceName = false;
    this.toggleClickOutsideListener(isEditingOiceName);
    this.setState({ isEditingOiceName });
  }

  handleOiceNameChange = (name) => {
    this.setState({ name });
  }

  handleToggleOiceSharingOption = (toggled) => {
    const { onToggleSharingOption, oice } = this.props;
    if (onToggleSharingOption) {
      onToggleSharingOption({
        sharingOption: toggled ? 0 : 1,
        oiceId: oice.id,
      });
    }
  }

  handleClickDeleteOiceButton = () => {
    const { onDeleteOice, oice } = this.props;
    if (onDeleteOice) onDeleteOice(oice.id);
  }

  handleOnKeyPress = (key) => {
    if (key === 'Enter') {
      this.handleSaveOiceName();
    }
  }

  handleClickOutside = ({ target }) => {
    // save if not edit button or text field is clicked
    if (!((this.textField && findDOMNode(this.textField).contains(target)) ||
      (this.flatButton && findDOMNode(this.flatButton).contains(target))
    )) {
      this.handleSaveOiceName();
    }
  }

  handleClickOice = () => {
    // stop fetching word count
    this._fetchWordCountThrottle.cancel();

    // update link, fetch selected oice, close the Modal
    const { dispatch, oice } = this.props;
    dispatch(push(`story/${oice.storyId}/oice/${oice.id}`));
    dispatch(OiceAction.fetchSelectedOice(oice.id));
    dispatch(Actions.toggle({ open: false }));
  }

  handleSelectRow = () => {
    const { onSelectRow, index } = this.props;
    if (onSelectRow) onSelectRow(index);
  }

  handleMouseEnter = () => {
    this._fetchWordCountThrottle(this.props);
    this.setState({ isHovering: true });
  }

  handleMouseLeave = () => {
    this._fetchWordCountThrottle.cancel();
    this.setState({ isHovering: false });
  }

  toggleClickOutsideListener(enabled) {
    if (enabled) {
      window.addEventListener('mousedown', this.handleClickOutside);
    } else {
      window.removeEventListener('mousedown', this.handleClickOutside);
    }
  }

  render() {
    const {
      t,
      isDragging,
      isSelected,
      connectDragSource,
      connectDragPreview,
      connectDropTarget,
      oice,
      index,
    } = this.props;
    const {
      isEditingOiceName,
      isHovering,
    } = this.state;

    const oiceRowClassName = classNames('oice-row', {
      dragging: isDragging,
      selected: isSelected,
    });

    return connectDropTarget(connectDragPreview(
      <div
        key={`oice-row-${oice.id}`}
        className={oiceRowClassName}
        onClick={this.handleSelectRow}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div className="left-details">
          {connectDragSource(<div className="oice-drag-handle"><DragHandleIcon /></div>)}
          <span>{index + 1}</span>
          {isEditingOiceName ? (
            <div className="oice-name-field">
              <TextField
                ref={ref => this.textField = ref}
                placeholder={t('placeholder.name')}
                value={this.state.name}
                onChange={this.handleOiceNameChange}
                onKeyPress={this.handleOnKeyPress}
              />
            </div>
          ) : (
            <div className="oice-name-field">
              <span onClick={this.handleClickOice}>{oice.name}</span>
              <FlatButton
                ref={ref => this.flatButton = ref}
                icon={<EditIcon />}
                onClick={this.handleClickEditOiceNameButton}
              />
            </div>
          )}
        </div>
        <div className="right-button-group">
          {(isHovering || isSelected) && <WordCount count={oice.wordCount} />}
          <ToggleButton
            leftLabel={t('label.notPublic')}
            rightLabel={t('label.public')}
            narrow
            toggled={oice.sharingOption === 0}
            onToggle={this.handleToggleOiceSharingOption}
          />
          <FlatButton
            icon={<DeleteIcon />}
            onClick={this.handleClickDeleteOiceButton}
          />
        </div>
      </div>
    ));
  }
}
