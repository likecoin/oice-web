import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';


export default class Checkbox extends React.Component {
  static propTypes = {
    checkBoxUUID: PropTypes.string,
    id: PropTypes.string,
    isChecked: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    checkBoxUUID: uuid.v4(),
    id: undefined,
    isChecked: false,
    label: '',
    value: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      isChecked: props.isChecked,
      checkBoxUUID: props.checkBoxUUID,
      label: props.label,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value, isChecked, label } = nextProps;
    this.setState({ value, isChecked, label });
  }

  handleChange() {
    const { value, isChecked } = this.state;
    const { onChange } = this.props;
    if (onChange) onChange(!isChecked);
    this.setState({ isChecked: !isChecked });
  }

  render() {
    const {
      value, isChecked, checkBoxUUID, label,
    } = this.state;
    return (
      <div className="check-box" id={this.props.id}>
        <div key={checkBoxUUID} >
          <label htmlFor={`check-box-${checkBoxUUID}-${value}`}>
            <input
              checked={isChecked}
              id={`check-box-${checkBoxUUID}-${value}`}
              type="checkbox"
              value={value}
              onChange={() => this.handleChange()}
            />
            {label}
          </label>
        </div>
      </div>
    );
  }
}
