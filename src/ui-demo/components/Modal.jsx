import React, { Component } from 'react';

import AddIcon from 'common/icons/add';
import CloseIcon from 'common/icons/close';

import RaisedButton from 'ui-elements/RaisedButton';
import Modal from 'ui-elements/Modal';

import request from 'superagent';

export default class ModalDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open1: false,
      open2: false,
      open3: false,
      text: '',
    };
  }

  componentDidMount() {
    request
      .get('https://baconipsum.com/api/?type=all-meat&paras=30&format=text')
      .then(({ text }) => {
        this.setState({ text });
      });
  }

  handleOnClose = () => {
    this.setState({
      open1: false,
      open2: false,
      open3: false,
    });
  }

  handleOnClose3 = () => {
    this.setState({
      open3: false,
    });
  }

  handleOnClick1 = () => {
    this.setState({ open1: !this.state.open1 });
  }

  handleOnClick2 = () => {
    this.setState({ open2: !this.state.open2 });
  }

  handleOnClick3 = () => {
    this.setState({ open3: !this.state.open3 });
  }

  renderBasicModal() {
    return (
      <span>
        <RaisedButton label="Basic" onClick={this.handleOnClick1} />
        <Modal open={this.state.open1}>
          <Modal.Header onClickCloseButton={this.handleOnClose}>
            Basic Modal Example
          </Modal.Header>
          <Modal.Body>
            This is a basic modal.
          </Modal.Body>
          <Modal.Footer
            leftButtonTitle="Left Button Title"
            onClickLeftButton={this.handleClose}
            rightButtonTitle="Right Button Title"
            onClickRightButton={this.handleOnClose}
          />
        </Modal>
      </span>
    );
  }

  renderAdvancedModal() {
    const button1 = <RaisedButton destructive label="Reset" onClick={this.handleOnClick3} />;
    const button2 = <RaisedButton label="Cancel" onClick={this.handleOnClick3} />;
    const button3 = <RaisedButton primary label="Confrim" onClick={this.handleOnClick3} />;

    return (
      <span>
        <RaisedButton label="Custom" onClick={this.handleOnClick2} />
        <Modal
          open={this.state.open2}
          onClickOutside={this.handleOnClose}
        >
          <Modal.Header
            onClickQuestionButton={this.handleOnClose}
            onClickCloseButton={this.handleOnClose}
          >
            Custom Modal Example
          </Modal.Header>
          <Modal.Body>
            <RaisedButton label="Open Another Modal" onClick={this.handleOnClick3} />
          </Modal.Body>
          <Modal.Footer
            leftItems={[button1]}
            rightItems={[button2, button3]}
          />
        </Modal>
        {this.renderCustomWidthModal()}
      </span>
    );
  }

  renderCustomWidthModal() {
    return (
      <Modal open={this.state.open3} width={1024}>
        <Modal.Header onClickCloseButton={this.handleOnClose3}>
          Custom Width Modal
        </Modal.Header>
        <Modal.Body>
          {this.state.text}
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    return (
      <div>
        <h3>Modal</h3>
        {this.renderBasicModal()}
        {this.renderAdvancedModal()}
      </div>
    );
  }
}
