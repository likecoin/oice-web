import React from 'react';
import PropTypes from 'prop-types';

import FlatButton from 'common/components/FlatButton';
import Progress from 'common/components/Progress';

import QuestionIcon from 'common/icons/question';
import CloseIcon from 'common/icons/close';

export default class ModalHeader extends React.Component {
  static defaultProps = {
    loading: false,
    showQuestionButton: false,
    closeButtonDisabled: false,
  }

  static propTypes = {
    children: PropTypes.node,
    closeButtonDisabled: PropTypes.bool,
    loading: PropTypes.bool,
    onClickQuestionButton: PropTypes.func,
    onClickCloseButton: PropTypes.func,
  }

  handleOnClickQuestionButton = () => {
    if (this.props.onClickQuestionButton) this.props.onClickQuestionButton();
  }

  handleOnClickCloseButton = () => {
    if (this.props.onClickCloseButton) this.props.onClickCloseButton();
  }

  render() {
    return (
      <div className="modal-header">
        <span className="modal-title">
          {this.props.children}
        </span>
        <span className="modal-header-buttons">
          {this.props.onClickQuestionButton &&
            <FlatButton
              icon={<QuestionIcon />}
              onClick={this.handleOnClickQuestionButton}
            />
          }
          {this.props.onClickCloseButton &&
            <FlatButton
              disabled={this.props.closeButtonDisabled}
              icon={<CloseIcon />}
              onClick={this.handleOnClickCloseButton}
            />
          }
        </span>
        {this.props.loading &&
          <div className="modal-progress">
            <Progress />
          </div>
        }
      </div>
    );
  }
}
