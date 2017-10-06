import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';

import { toggleAlertDialog } from './redux';

@translate(['alertDialog'])
@connect(store => ({ ...store.alertDialog }))
export default class AlertDialog extends React.Component {
  static toggle = toggleAlertDialog;
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['confirm', 'error', 'alert']).isRequired,
    body: PropTypes.node,
    cancelButtonTitle: PropTypes.string,
    cancelCallback: PropTypes.func,
    confirmButtonTitle: PropTypes.string,
    confirmCallback: PropTypes.func,
    title: PropTypes.string,
    width: PropTypes.number,
  }

  handleCloseButtonClick = () => {
    this.props.dispatch(toggleAlertDialog());
  }

  handleCancelButtonClick = () => {
    this.handleCloseButtonClick();
    if (this.props.cancelCallback) {
      this.props.cancelCallback();
    } else if (this.props.type === 'error') {
      window.location.reload(true);
    }
  }

  handleConfirmButtonClick = () => {
    this.handleCloseButtonClick();
    if (this.props.confirmCallback) {
      this.props.confirmCallback();
    }
  }

  render() {
    const {
      body,
      cancelButtonTitle,
      confirmButtonTitle,
      open,
      t,
      title,
      type,
      width,
    } = this.props;

    let cancelButton;
    switch (type) {
      case 'alert':
        break;
      case 'confirm':
      case 'error':
      default:
        cancelButton = (
          <RaisedButton
            label={cancelButtonTitle || t(`${type}.button.cancel`)}
            destructive
            onClick={this.handleCancelButtonClick}
          />
        );
        break;
    }

    let confirmButton;
    switch (type) {
      case 'error':
        break;
      case 'confirm':
      case 'alert':
      default:
        confirmButton = (
          <RaisedButton
            label={
              confirmButtonTitle ||
              t(`${type}.button.confirm`)
            }
            primary
            onClick={this.handleConfirmButtonClick}
          />
        );
        break;
    }

    return (
      <Modal open={open} width={width}>
        <Modal.Header
          onClickCloseButton={
            type !== 'error' ?
            this.handleCloseButtonClick :
            undefined
          }
        >
          {title || t(`${type}.title`)}
        </Modal.Header>
        <Modal.Body>
          {typeof body === 'string' ?
            t(`error:${body}`) : body
          }
        </Modal.Body>
        <Modal.Footer
          leftItems={[]}
          rightItems={[cancelButton, confirmButton]}
        />
      </Modal>
    );
  }
}
