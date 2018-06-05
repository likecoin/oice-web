import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import _isArray from 'lodash/isArray';

import ArrowIcon from 'common/icons/arrow/down';

import './Dropdown.styles.scss';


export default class Dropdown extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.string,
    })).isRequired,
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    leftIcon: PropTypes.node,
    onChange: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      value: props.defaultValue || props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    const state = {};
    state.value = nextProps.value || this.state.value;
    this.setState(state);
  }

  handleSelectValueChange = (event) => {
    const { value } = event.target;
    this.setState({ value });

    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  }

  renderOption = ({ value, text }) => (
    <option key={value} value={value}>
      {text}
    </option>
  )

  renderOptions() {
    return (
      <select value={this.state.value} onChange={this.handleSelectValueChange}>
        {this.props.options.map(this.renderOption)}
      </select>
    );
  }

  renderLeftIcon() {
    const { leftIcon } = this.props;
    return !!leftIcon && (
      <div className="drop-down-left-icon">
        {leftIcon}
      </div>
    );
  }

  renderLabel() {
    const selectedOption = this.props.options.find(({ value }) => value === this.state.value);
    if (!selectedOption) {
      return null;
    }

    return (
      <span className="label">{selectedOption.text}</span>
    );
  }

  render() {
    const { id, options } = this.props;

    const className = classNames('dropdown-legacy');

    const isEmpty = !_isArray(options);

    return (
      <div {...{ id, className }}>
        {!isEmpty && this.renderOptions()}
        {this.renderLeftIcon()}
        {!isEmpty && this.renderLabel()}
        <i><ArrowIcon /></i>
      </div>
    );
  }
}
