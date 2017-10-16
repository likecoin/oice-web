import React from 'react';
import PropTypes from 'prop-types';

import './ProgressBar.scss';

export default class ProgressBar extends React.Component {
  static defaultProps = {
    percent: 0,
  }

  static propTypes = {
    percent: PropTypes.number,
    onChange: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      isDragging: 0,
    };
  }

  handleMouseClick = (e) => {
    const container = e.currentTarget;
    const containerStartX = container.offsetLeft;
    const rect = container.getBoundingClientRect();
    let percent = (e.clientX - containerStartX) / container.offsetWidth;
    if (rect) {
      percent = (e.clientX - rect.left) / container.offsetWidth;
    }
    percent = percent >= 1 ? 1 : percent;
    if (this.props.onChange) {
      this.props.onChange(percent);
    }
  }

  handleMouseDown = (e) => {
    const { isDragging } = this.state;
    this.setState({ isDragging: true });
  }

  handleMouseMove = (e) => {
    const { isDragging } = this.state;
    if (!isDragging) return;
    this.handleMouseClick(e);
  }

  handleMouseEnter = (e) => {
    if (e.buttons !== 1) this.setState({ isDragging: false });
  }

  handleMouseUp = (e) => {
    this.setState({ isDragging: false });
  }

  render() {
    const { percent } = this.props;
    const style = { width: `${percent * 100}%` };
    return (
      <div
        className="progress-bar"
        onClick={this.handleMouseClick}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseEnter={this.handleMouseEnter}
      >
        <div className="prgoress-bar-progress" style={style} />
      </div>
    );
  }
}
