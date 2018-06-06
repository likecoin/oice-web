import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CardImage from './Image';
import CardContent from './Content';
import CardHeader from './Header';
import CardMeta from './Meta';
import AddIcon from '../../icons/add';


import './style.scss';

export default class Card extends React.Component {
  static displayName = 'Card';
  static Image = CardImage;
  static Content = CardContent;
  static Header = CardHeader;
  static Meta = CardMeta;

  static propTypes = {
    add: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    onClick: PropTypes.func,
    onDoubleClickCard: PropTypes.func,
    selected: PropTypes.bool,
    hidePointer: PropTypes.bool, // for NORMAL user can not edit asset
    style: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
  }

  static defaultProps = {
    selected: false,
    add: false,
    hidePointer: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: props.selected,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selected,
    });
  }

  onClick = (e) => {
    if (this.props.onClick) this.props.onClick(e);
  }
  onDoubleClick = () => {
    if (this.props.onDoubleClickCard) this.props.onDoubleClickCard();
  }

  render() {
    const {
      id,
      width,
      height,
      add,
    } = this.props;
    const { selected } = this.state;

    const style = this.props.style || {};
    if (!style.width) {
      style.width = '100%';
    }

    const className = classNames('card-container', this.props.className, {
      selected,
      add,
    });
    const ownStyle = {
      ...style,
      width: width || style.width,
      height: height || style.height,
    };
    if (!this.props.hidePointer) ownStyle.cursor = 'pointer';

    return (
      <div
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        {...{ id, className }}
        style={ownStyle}
      >
        {add ? <AddIcon /> : this.props.children}
      </div>
    );
  }
}
