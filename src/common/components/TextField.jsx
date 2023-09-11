import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const handleValueIs0 = value => ((value || value === 0) ? value : '');
export default class TextField extends React.Component {
  static propTypes = {
    autoFocus: PropTypes.bool,
    border: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    id: PropTypes.string,
    isNumber: PropTypes.bool,
    maxLength: PropTypes.number,
    multiLine: PropTypes.bool,
    placeholder: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    readonly: PropTypes.bool,
    showCharactersCount: PropTypes.bool,
    showWarning: PropTypes.bool,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyPress: PropTypes.func,
    onSelect: PropTypes.func,
  }

  static defaultProps = {
    autoFocus: false,
    border: true,
    disabled: false,
    fullWidth: false,
    maxLength: null,
    multiLine: false,
    placeholder: '',
    readonly: false,
    showCharactersCount: false,
    showWarning: false,
  }

  constructor(props) {
    super(props);
    // console.log('Textfield constructor', props.value);
    this.state = {
      value: handleValueIs0(props.value),
    };
  }

  componentWillReceiveProps({ value }) {
    this.setState({ value: handleValueIs0(value) });
  }

  getValue = () => this.state.value || '';

  handleChange = (event) => {
    const {
      onChange,
      isNumber,
      readonly,
    } = this.props;
    if (!readonly) {
      const { value } = event.target;
      this.setState({ value });
      if (onChange) onChange(isNumber ? parseInt(value, 10) : value);
    }
  }

  handleOnKeyPress = (event) => {
    if (event && event.key && this.props.onKeyPress) {
      this.props.onKeyPress(event.key);
    }
  }

  handleFocus = (event) => {
    if (this.props.onFocus) this.props.onFocus(event);
  }

  handleSelect = (event) => {
    if (this.props.onSelect) this.props.onSelect(event);
  }

  blur = () => {
    if (this.input) this.input.blur();
    console.debug('handleUpdateAttribute', this.input);
  }

  renderTextField() {
    const {
      maxLength,
      showWarning,
      multiLine,
      placeholder,
      disabled,
      isNumber,
      autoFocus,
    } = this.props;

    const props = {
      autoFocus,
      disabled,
      maxLength,
      onChange: this.handleChange,
      onFocus: this.handleFocus,
      onSelect: this.handleSelect,
      placeholder,
      size: maxLength,
      value: this.state.value,
    };
    if (multiLine) {
      return (
        <textarea
          ref={ref => this.input = ref}
          cols="50"
          rows="4"
          {...props}
        />
      );
    }
    return (
      <input
        ref={ref => this.input = ref}
        style={showWarning ? { borderColor: 'red' } : null}
        type={isNumber ? 'number' : 'text'}
        {...props}
        onKeyPress={this.handleOnKeyPress}
      />
    );
  }

  renderCharactersCount() {
    const { maxLength, multiLine, showCharactersCount } = this.props;
    // console.log('renderCharactersCount this.state.value:%s this.state.value.length:%s maxLength:%s', this.state.value, this.state.value.length, maxLength);
    return multiLine && maxLength && showCharactersCount && (
      <div className="characters-count">
        {`${this.state.value.length}/${maxLength}`}
      </div>
    );
  }

  render() {
    const {
      border,
      disabled,
      fullWidth,
      id,
      multiLine,
      readonly,
    } = this.props;

    const className = classNames('text-field', this.props.className, {
      'multi-line': multiLine,
      block: fullWidth,
      border,
      disabled,
      readonly,
    });

    return (
      <div {...{ id, className }}>
        {this.renderTextField()}
        {this.renderCharactersCount()}
      </div>
    );
  }
}
