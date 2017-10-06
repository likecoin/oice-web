import React from 'react';
import PropTypes from 'prop-types';

import FlatButton from 'ui-elements/FlatButton';
import TextField from 'ui-elements/TextField';

import CancelIcon from 'common/icons/cancel';
import CheckIcon from 'common/icons/check';


export default class StoryListNewRow extends React.Component {
  static defaultProps = {
    placeholder: '',
  }

  static propTypes = {
    placeholder: PropTypes.string,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      confirmDisabled: true,
      value: '',
    };
  }

  handleCancelButtonClick = () => {
    if (this.props.onCancel) this.props.onCancel();
  }

  handleConfirmButtonClick = () => {
    if (this.props.onConfirm) this.props.onConfirm(this.state.value);
  }

  handleTextFieldChange = (value) => {
    this.setState({
      confirmDisabled: value.length < 1,
      value,
    });
  }

  handleTextFieldKeyPress = (key) => {
    if (key === 'Enter' && this.state.value.length >= 1) {
      this.handleConfirmButtonClick();
    }
  }

  render() {
    const { confirmDisabled, value } = this.state;
    return (
      <div className="list-row new">
        <TextField
          border={false}
          placeholder={this.props.placeholder}
          value={value}
          autoFocus
          onChange={this.handleTextFieldChange}
          onKeyPress={this.handleTextFieldKeyPress}
        />
        <div className="confirm-button-group">
          <FlatButton
            icon={<CancelIcon />}
            onClick={this.handleCancelButtonClick}
          />
          <FlatButton
            disabled={confirmDisabled}
            icon={<CheckIcon />}
            onClick={this.handleConfirmButtonClick}
          />
        </div>
      </div>
    );
  }
}
