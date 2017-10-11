import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FlatButton from './FlatButton';

export default class Tab extends React.Component {
  static displayName = 'Tab'

  static defaultProps = {
    title: '',
    selected: false,
  }

  static propTypes = {
    index: PropTypes.number.isRequired,
    selected: PropTypes.bool,
    title: PropTypes.node,
    onClick: PropTypes.func,
  }

  handleOnClick = () => {
    const { onClick, index } = this.props;
    if (onClick) onClick(index);
  }

  render() {
    const { title, selected } = this.props;

    const className = classNames('tab-bar-item', {
      selected,
    });

    return (
      <li {...{ className }} onClick={this.handleOnClick}>
        <FlatButton label={title} fullWidth />
      </li>
    );
  }
}
