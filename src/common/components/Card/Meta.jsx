import React, { Component } from 'react';

export default class CardMeta extends React.Component {
  render() {
    return (
      <div className="card-meta">
        {this.props.children}
      </div>
    );
  }
}
