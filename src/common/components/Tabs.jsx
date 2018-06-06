import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tab from './Tab';
import FlatButton from './FlatButton';

export default class Tabs extends React.Component {
  static defaultProps = {
    defaultValue: 0,
  }

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    defaultValue: PropTypes.number,
    id: PropTypes.string,
    rightBarItem: PropTypes.node,
    value: PropTypes.number,
    onChange: PropTypes.func,
    onClick: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: props.value ? props.value : props.defaultValue,
    };
  }

  componentWillReceiveProps({ value }) {
    if (value) this.setState({ selectedIndex: value });
  }

  handleOnTabItemClick = selectedIndex => {
    this.setState({ selectedIndex });
    if (this.props.onChange) this.props.onChange(selectedIndex);
  }

  createTabBarItem(element, index) {
    return React.cloneElement(element, {
      key: index,
      index,
      selected: this.state.selectedIndex === index,
      onClick: this.handleOnTabItemClick,
    });
  }

  renderSelectedTab(tab) {
    if (tab) {
      const className = classNames('tab-content', tab.props.className);
      return (
        <section className={className} id={tab.props.id}>
          {tab.props.children}
        </section>
      );
    }
    return undefined;
  }

  render() {
    const {
      id, children, onClick, rightBarItem,
    } = this.props;
    const { selectedIndex } = this.state;

    const tabBarItems = [];

    // Inject props into children
    React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      if (child.type.displayName === 'Tab') {
        tabBarItems.push(this.createTabBarItem(child, index));
      }
    });

    const className = classNames('tabs', {
      'first-selected': selectedIndex === 0,
    }, this.props.className);

    const selectedTab = tabBarItems.length > 0 && tabBarItems[selectedIndex];

    return (
      <div {...{ id, className }}>
        <ul className="tab-bar">
          <div className="tab-bar-items">
            {tabBarItems}
          </div>
          {rightBarItem &&
            <li className="tab-bar-item right">
              {rightBarItem}
            </li>
          }
        </ul>
        {this.renderSelectedTab(selectedTab)}
      </div>
    );
  }
}
