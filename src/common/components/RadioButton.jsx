import React from 'react';
import PropTypes from 'prop-types';

export default class RadioButton extends React.Component {
  static defaultProps = {
    values: [],
    selectedIndex: 0,
  }

  static propTypes = {
    groupName: PropTypes.string,
    onChange: PropTypes.func,
    selectedIndex: PropTypes.number,
    values: PropTypes.array,
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedValue: this.getSelectedValueFromProps(props),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selectedValue: this.getSelectedValueFromProps(nextProps),
    });
  }

  getSelectedValueFromProps = (props) => {
    const { values, selectedIndex } = props;
    const isInvalidValue = selectedIndex > values.length - 1 || selectedIndex < 0;
    return isInvalidValue ? values[0] : values[selectedIndex];
  }

  handleChange = (index, value) => {
    this.setState({ selectedValue: value });
    if (this.props.onChange) this.props.onChange(index, value);
  }

  render() {
    const { groupName, values } = this.props;
    return (
      <div className="radio-button-group">
        {values.map((value, index) => (
          <div key={index}>
            <input
              id={`radio-input-${index}`}
              name={groupName}
              type="radio"
              checked={this.state.selectedValue === value}
              value={value}
              onChange={() => this.handleChange(index, value)}
            />
            <label htmlFor={`radio-input-${index}`}>{value}</label> {/* eslint-disable-line */}
          </div>
        ))}
      </div>
    );
  }
}
