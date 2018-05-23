import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import './style.scss';


export default class TabBar extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    selectedIndex: PropTypes.number,
    onChange: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = { selectedIndex: props.selectedIndex || 0 };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedIndex !== undefined) {
      this.setState({ selectedIndex: nextProps.selectedIndex });
    }
  }

  componentDidUpdate() {
    if (this.nav && this.rootElement) {
      this.nav.style.maxWidth = `${this.rootElement.clientWidth}px`;
    }
  }

  getRootElement = () => this.rootElement;

  getNavElement = () => this.nav;

  handleItemClick = (index) => {
    if (this.props.onChange) {
      this.props.onChange(index);
    }
    this.setState({ selectedIndex: index });
  }

  renderItems = (item, index) => {
    const { selectedIndex } = this.state;

    const className = classNames(
      'tabbar-item', {
        selected: index === selectedIndex,
        disabled: item.disabled,
      }
    );

    return (
      <li
        key={index}
        className={className}
        onClick={() => this.handleItemClick(index)}
      >
        {item.icon}
        <span>{item.text}</span>
      </li>
    );
  }

  renderTab() {
    const { children } = this.props;
    const { selectedIndex } = this.state;

    const validChildren = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        validChildren.push(child);
      }
    });

    let tab;
    React.Children.forEach(validChildren, (child, index) => {
      if (tab || !React.isValidElement(child) || index !== selectedIndex) return;
      tab = React.cloneElement(child, {
        key: index,
        className: classNames(
          child.props.className,
          'tabbar-content',
        ),
      });
    });

    return tab;
  }

  render() {
    const { children, id, items } = this.props;

    const rootClassName = classNames(
      'tabbar',
      this.props.className
    );

    const tabBarNav = (
      <ul ref={ref => this.nav = ref} className="tabbar-nav">
        {items.map(this.renderItems)}
      </ul>
    );

    if (!children) {
      return tabBarNav;
    }

    return (
      <div
        ref={ref => this.rootElement = ref}
        className={rootClassName}
        id={id}
      >
        {tabBarNav}
        <div className="tabbar-content-wrapper">
          {this.renderTab()}
        </div>
      </div>
    );
  }
}
