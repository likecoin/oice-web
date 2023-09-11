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

import './Modal.scss';

@keyListener(KEY.ESC)
export default class Modal extends React.Component {
  static Header = ModalHeader;
  static Body = ModalBody;
  static Footer = ModalFooter;

  static propTypes = {
    children: PropTypes.node.isRequired,
    open: PropTypes.bool.isRequired,
    className: PropTypes.string,
    id: PropTypes.string,
    keydown: PropTypes.string,
    width: PropTypes.number,
    onClickOutside: PropTypes.func,
  }

  static defaultProps = {
    width: 568,
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
  }

  handleClose = () => {
    if (this.props.onClickOutside) this.props.onClickOutside();
  }

  render() {
    const { id, open, width } = this.props;

    const className = classNames('modal-two', this.props.className, {
      open,
    });

    return (
      <div {...{ id, className }}>
        <div
          className="modal-two-overlay"
          onClick={this.handleClose}
        />
        <div
          ref={ref => this.modalContainer = ref}
          className="modal-two-container"
          style={{ width }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}
