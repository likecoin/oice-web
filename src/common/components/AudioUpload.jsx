import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import AddIcon from 'common/icons/add';
import FlatButton from 'ui-elements/FlatButton';


export default class AudioUpload extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    label: PropTypes.string,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    disabled: false,
  }

  handleClick = () => {
    if (!this.props.disabled) this.audioUpload.click();
  }

  handleChange = ({ target }) => {
    const fileList = [];
    Array.prototype.push.apply(fileList, target.files);
    this.props.onChange(fileList);
  }

  render() {
    const { disabled, label } = this.props;
    return (
      <div>
        <input
          ref={e => this.audioUpload = e}
          accept="audio/x-wav,audio/mpeg3,audio/x-m4a"
          style={{ display: 'none' }}
          type="file"
          onChange={this.handleChange}
          onClick={() => { this.audioUpload.value = ''; }} // Clear selected files
        />
        <FlatButton
          disabled={disabled}
          icon={<AddIcon />}
          label={label}
          onClick={this.handleClick}
        />
      </div>
    );
  }
}
