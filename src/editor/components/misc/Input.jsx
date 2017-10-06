import React, { Component } from 'react';

export default class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  getValue() {
    return this.state.value;
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }


  render() {
    return (
      <input
        type="text"
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
