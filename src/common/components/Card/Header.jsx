import React, { Component } from 'react';

export default class CardHeader extends React.Component {
  render() {
    return (
      <span className="card-header">
        {this.props.children}
      </span>
    );
  }
}
