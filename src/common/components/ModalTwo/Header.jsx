import React from 'react';
import PropTypes from 'prop-types';

import FlatButton from 'ui-elements/FlatButton';
import CloseIcon from 'common/icons/close-bold';

export default class ModalHeader extends React.Component {
  static defaultProps = {
    loading: false,
    showQuestionButton: false,
  }

  static propTypes = {
    children: PropTypes.node,
    loading: PropTypes.bool,
    onClickCloseButton: PropTypes.func,
  }

  handleOnClickCloseButton = () => {
    if (this.props.onClickCloseButton) this.props.onClickCloseButton();
  }

  render() {
    return (
      <div className="modal-two-header">
        <span className="modal-title">
          {this.props.children}
        </span>
        <span className="modal-two-header-button">
          {this.props.onClickCloseButton &&
            <FlatButton
              icon={<CloseIcon />}
              onClick={this.handleOnClickCloseButton}
            />
          }
        </span>
      </div>
    );
  }
}
