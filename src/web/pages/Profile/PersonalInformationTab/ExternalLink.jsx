import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { DragSource, DropTarget } from 'react-dnd';

import classNames from 'classnames';
import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';
import FlatButton from 'ui-elements/FlatButton';
import TextField from 'ui-elements/TextField';
import ToggleButton from 'ui-elements/ToggleButton';

import DeleteIcon from 'common/icons/rubbish-bin-2';
import DragHandleIcon from 'common/icons/drag';
import EditIcon from 'common/icons/edit-2';

import FacebookIcon from 'common/icons/links/fb-icon';
import TwitterIcon from 'common/icons/links/tw-icon';
import PivixIcon from 'common/icons/links/pix-icon';
import InstagramIcon from 'common/icons/links/ig-icon';
import SoundcloudIcon from 'common/icons/links/sc-icon';
import MirrorIcon from 'common/icons/links/mirr-icon';
import UrlIcon from 'common/icons/links/url-icon';
import ClapIcon from 'common/icons/links/clap';

import FacebookGreyIcon from 'common/icons/links/fb-icon-grey';
import TwitterGreyIcon from 'common/icons/links/tw-icon-grey';
import PivixGreyIcon from 'common/icons/links/pix-icon-grey';
import InstagramGreyIcon from 'common/icons/links/ig-icon-grey';
import SoundcloudGreyIcon from 'common/icons/links/sc-icon-grey';
import MirrorGreyIcon from 'common/icons/links/mirr-icon-grey';
import UrlGreyIcon from 'common/icons/links/url-icon-grey';
import ClapGreyIcon from 'common/icons/links/clap-grey';


import { LINK_ALIAS } from '../Profile.constants';

export function getLinkIcon(alias, grey = false) {
  switch (alias) {
    case LINK_ALIAS.FACEBOOK:
      return grey ? <FacebookGreyIcon /> : <FacebookIcon />;
    case LINK_ALIAS.TWITTER:
      return grey ? <TwitterGreyIcon /> : <TwitterIcon />;
    case LINK_ALIAS.PIVIX:
      return grey ? <PivixGreyIcon /> : <PivixIcon />;
    case LINK_ALIAS.INSTAGRAM:
      return grey ? <InstagramGreyIcon /> : <InstagramIcon />;
    case LINK_ALIAS.SOUNDCLOUD:
      return grey ? <SoundcloudGreyIcon /> : <SoundcloudIcon />;
    case LINK_ALIAS.MIRROR_FICTION:
      return grey ? <MirrorGreyIcon /> : <MirrorIcon />;
    case LINK_ALIAS.LIKECOIN:
      return grey ? <ClapGreyIcon /> : <ClapIcon />;
    default:
      return grey ? <UrlGreyIcon /> : <UrlIcon />;
  }
}

const boxSource = {
  beginDrag(props) {
    return {
      id: props.link.id,
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

    props.onDrag(dragIndex, hoverIndex, props.link);
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

    props.onHoverDrag(dragIndex, hoverIndex);
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
@translate(['general', 'Profile'])
export default class ExternalLink extends React.Component {
  static propTypes = {
    connectDragPreview: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool,
    isDeleting: PropTypes.bool,
    t: PropTypes.func.isRequired,
    link: PropTypes.object,
    linkTypes: PropTypes.array,
    onSaveLink: PropTypes.func,
    onDeleteLink: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      label: undefined,
      link: undefined,
      typeAlias: undefined,
      disabled: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { isSaving, isDeleting } = nextProps;
    if (isSaving || isDeleting) {
      this.setState({ disabled: true });
    } else if (this.props.isSaving !== isSaving) {
      // just finished saving
      this.setState({
        disabled: false,
        isEditing: false,
      });
    }
  }

  handleLabelChange = (label) => {
    this.setState({ label });
  }

  handleLinkChange = (link) => {
    const { linkTypes } = this.props;
    const typeAlias = linkTypes.find((type) => {
      const regex = new RegExp(type.linkRegex);
      return regex.test(link);
    }) || {};

    this.setState({
      typeAlias: typeAlias.alias,
      link,
    });
  }

  handleClickDeleteButton = () => {
    const { link, onDeleteLink } = this.props;
    if (onDeleteLink) onDeleteLink(link.id);
  }

  handleClickEditButton = () => {
    this.setState({
      isEditing: true,
      ...this.props.link,
    });
  }

  handleSaveLink = () => {
    const { label, link, typeAlias } = this.state;
    const { onSaveLink } = this.props;
    if (onSaveLink) onSaveLink({ label, link, typeAlias });
  }

  handleLinkFieldKeyPress = (key) => {
    if (key === 'Enter' && this.isAllFilledIn()) {
      this.handleSaveLink();
    }
  }

  isEditing = () => (this.props.link.id < 0 || this.state.isEditing);

  isAllFilledIn = () => {
    const { label, link } = this.state;
    return label && link;
  }

  renderLeftDetails(isEditing) {
    const { t, connectDragSource, link } = this.props;
    const { label, typeAlias } = isEditing ? this.state : link;
    const linkIcon = getLinkIcon(typeAlias);
    const className = classNames('left-details', {
      disabled: this.state.disabled,
    });
    return (
      <div className={className}>
        {connectDragSource(
          <div className="drag-handle">
            {link.id && <DragHandleIcon />}
          </div>
        )}
        {linkIcon}
        {isEditing ? (
          <TextField
            placeholder={t('personalInformation.placeholder.enterLabel')}
            maxLength={1024}
            showWarning={!this.state.label}
            value={label}
            onChange={this.handleLabelChange}
          />
        ) : (
          <div>{label}</div>
        )}
      </div>
    );
  }

  renderRightDetails(isEditing) {
    const { t, onSaveLink } = this.props;
    const { label, link, typeAlias } = isEditing ? this.state : this.props.link;
    const className = classNames('right-details', {
      disabled: this.state.disabled,
    });
    return (
      <div className={className}>
        {isEditing ? (
          <TextField
            placeholder={t('personalInformation.placeholder.enterLink')}
            maxLength={1024}
            showWarning={!this.state.link}
            value={link}
            onChange={this.handleLinkChange}
            onKeyPress={this.handleLinkFieldKeyPress}
          />
        ) : (
          <span>{link}</span>
        )}
        {isEditing ? (
          <FlatButton
            className="confirm-button"
            disabled={!this.isAllFilledIn()}
            label={t('confirm')}
            onClick={this.handleSaveLink}
          />
        ) : (
          <FlatButton
            icon={<EditIcon />}
            onClick={this.handleClickEditButton}
          />
        )}
        <FlatButton
          icon={<DeleteIcon />}
          onClick={this.handleClickDeleteButton}
        />
      </div>
    );
  }

  render() {
    const {
      t,
      isDragging,
      connectDragPreview,
      connectDropTarget,
      link,
      index,
    } = this.props;

    const className = classNames('external-link', {
      dragging: isDragging,
    });

    const isEditing = this.isEditing();

    return connectDropTarget(connectDragPreview(
      <div className={className}>
        {this.renderLeftDetails(isEditing)}
        {this.renderRightDetails(isEditing)}
      </div>
    ));
  }
}
