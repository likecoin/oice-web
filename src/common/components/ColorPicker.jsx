import React from 'react';
import PropTypes from 'prop-types';

import { ChromePicker } from 'react-color';


export default class ColorsPicker extends React.Component {
  static defaultProps = {
    color: '#4a4a4a',
  }

  static propTypes = {
    color: PropTypes.string,
    onChange: PropTypes.func,
    attributeId: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      color: props.color,
      displayColorPicker: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { color } = this.props;
    this.setState({ color: nextProps.color });
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = (color) => {
    console.log('ColorPicker:', color);
    const colorHex = color.hex;
    if (this.props.onChange) this.props.onChange(colorHex);
    this.setState({ color: colorHex });
  }

  render() {
    const { color } = this.state;
    return (
      <div className="color-picker">
        <div className="color-picker-swatch" onClick={this.handleClick}>
          <div
            className="swatch-color"
            style={{ backgroundColor: color }}
          />
        </div>
        {this.state.displayColorPicker ?
          <div className="color-picker-popover">
            <div className="color-picker-cover" onClick={this.handleClose} />
            <ChromePicker color={color} onChange={this.handleChange} disableAlpha />
          </div>
        : null }
      </div>
    );
  }
}
