import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class CardContent extends React.Component {
  render() {
    const { id } = this.props;
    const className = classNames('card-content', this.props.className);
    return (
      <div {...{ id, className }} >
        {this.props.children}
      </div>
    );
  }
}
