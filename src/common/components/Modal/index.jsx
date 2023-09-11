import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import EventListener from 'react-event-listener';

import classNames from 'classnames';
import _get from 'lodash/get';

import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';

import { keyListener, KEY } from 'common/utils/KeyListener';

import ModalHeader from './Header';
import ModalBody from './Body';
import ModalFooter from './Footer';

import './styles.scss';

@keyListener(KEY.ESC)
export default class Modal extends React.Component {
  static Header = ModalHeader;
  static Body = ModalBody;
  static Footer = ModalFooter;

  static propTypes = {
    children: PropTypes.node.isRequired,
    open: PropTypes.bool.isRequired,
    className: PropTypes.string,
    height: PropTypes.string,
    id: PropTypes.string,
    keydown: PropTypes.string,
    width: PropTypes.number,
    onClickOutside: PropTypes.func,
  }

  static defaultProps = {
    width: 568,
  }

  componentDidMount() {
    this.handleBodyMaxHeight();
  }

  componentWillReceiveProps(nextProps) {
    const { open, keydown } = nextProps;
    if (open && keydown === KEY.ESC) {
      this.handleClose();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const modalBody = _get(this, 'modalContainer.children[1]');
    if (this.props.open && !prevProps.open && modalBody) {
      modalBody.scrollTop = 0;
    }
    this.handleBodyMaxHeight();
  }

  getModalBodyHeight() {
    const modalBody = _get(this, 'modalContainer.children[1]');
    if (!modalBody) return 0;
    modalBody.style.height = '';
    const actualModalBodyHeight = modalBody.scrollHeight;
    return actualModalBodyHeight;
  }

  handleResize = () => {
    this.handleBodyMaxHeight();
  }

  handleBodyMaxHeight() {
    const modalHeader = _get(this, 'modalContainer.children[0]');
    const modalBody = _get(this, 'modalContainer.children[1]');
    const modalFooter = _get(this, 'modalContainer.children[2]');
    if (!modalBody) return;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const actualModalBodyHeight = this.getModalBodyHeight();
    const maxBodyHeight = clientHeight
      - 50
      - modalHeader.offsetHeight
      - (modalFooter ? modalFooter.offsetHeight : 0);

    modalBody.style.height = this.props.height || `${actualModalBodyHeight}px`;
    modalBody.style.maxHeight = `${maxBodyHeight}px`;
  }

  handleClose = () => {
    if (this.props.onClickOutside) this.props.onClickOutside();
  }

  render() {
    const { id, open, width } = this.props;

    const className = classNames('modal', this.props.className, {
      open,
    });

    return (
      <div {...{ id, className }}>
        <EventListener
          target="window"
          onResize={this.handleResize}
        />
        <div
          className="modal-overlay"
          onClick={this.handleClose}
        />
        <div
          ref={ref => this.modalContainer = ref}
          className="modal-container"
          style={{ width }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}
