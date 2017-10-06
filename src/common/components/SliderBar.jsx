import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class SliderBar extends React.Component {
  static defaultProps = {
    min: 0,
    max: 10000,
    step: 1,
    initialVal: 0,
  }
  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func,
    initialVal: PropTypes.number,
    header: PropTypes.string,
    fullWidth: PropTypes.bool,
  }
  constructor(props) {
    super(props);
    const { initialVal } = props;
    this.state = {
      value: initialVal,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { initialVal } = nextProps;
    this.setState({
      value: initialVal,
    });
  }

  handleChange = (e) => {
    const valueGet = e.target.value;
    if (this.props.onChange) this.props.onChange(valueGet);
    this.setState({ value: valueGet });
  }

  render() {
    const {
      min,
      max,
      step,
      initialVal,
      header,
      fullWidth,
    } = this.props;

    const className = classNames({
      'full-width': fullWidth,
    });

    return (
      <div className="slider-bar">
        {header &&
          <h5>{header}</h5>
        }
        <div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={this.state.value}
            onChange={this.handleChange}
            {...{ className }}
          />
          <input
            type="number"
            min={min}
            max={max}
            value={this.state.value}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
}
