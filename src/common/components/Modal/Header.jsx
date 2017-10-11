import React from 'react';
import PropTypes from 'prop-types';

import FlatButton from '../FlatButton';
import QuestionIcon from 'common/icons/question';
import CloseIcon from 'common/icons/close';
import Progress from 'common/components/Progress';

export default class ModalHeader extends React.Component {
  static defaultProps = {
    loading: false,
    showQuestionButton: false,
  }

  static propTypes = {
    children: PropTypes.node,
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
