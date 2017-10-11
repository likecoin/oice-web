import React, { Component } from 'react';

import Pagination from 'ui-elements/Pagination';

export default class FlatButtonDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
    };
  }

  handleOnPageChange = (currentPage) => {
    this.setState({ currentPage });
  }

  render() {
    return (
      <Pagination
        currentPage={this.state.currentPage}
        totalPage={12}
        onPageChange={this.handleOnPageChange}
      />
    );
  }
}
