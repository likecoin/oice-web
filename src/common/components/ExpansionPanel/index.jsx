import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ExpansionPanelGroup from './Group';
import ArrowIcon from 'common/icons/arrow/down';

import './style.scss';

const ExpansionPanelSection = (props) => <div {...props} />;

ExpansionPanelSection.displayName = 'ExpansionPanelSection';

ExpansionPanelSection.propTypes = {
  center: PropTypes.bool,
  className: PropTypes.string,
};

ExpansionPanelSection.defaultProps = {
  center: false,
};

export default class ExpansionPanel extends React.Component {
  static displayName = 'ExpansionPanel';
  static Group = ExpansionPanelGroup;
  static Header = ExpansionPanelSection;
  static Content = ExpansionPanelSection;

  static propTypes = {
    arrowPosition: PropTypes.oneOf(['middle', 'top']),
    border: PropTypes.bool,
    children: PropTypes.node,
    either: PropTypes.bool,
    id: PropTypes.string,
    open: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    arrowPosition: 'middle',
    open: false,
    either: false,
    border: true,
  }

  constructor(props) {
    super(props);
    this.state = { open: props.open };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.props.open) {
      this.setState({ open: nextProps.open });
    }
  }

  handleHeaderClick = () => {
    const { either, onClick } = this.props;
    let { open } = this.state;
    if (!(open && either)) {
      open = this.handleToggleButtonClick();
    }
    if (onClick) onClick(open);
  }

  handleToggleButtonClick = () => {
    const open = !this.state.open;
    this.setState({ open });
    return open;
  }

  renderHeader(props, isShowArrowIcon) {
    const { arrowPosition, either } = this.props;
    const {
      center,
    } = props;
    const className = classNames({
      'expansion-panel-header': true,
      [props.className]: true,
      center,
      either,
    });
    return (
      <div
        {...{ className }}
        onClick={this.handleHeaderClick}
      >
        {props.children}
        {isShowArrowIcon &&
          <span
            className="arrow-icon"
            style={{
              margin: arrowPosition === 'middle' ? 'auto' : 'none',
            }}
            onClick={this.handleToggleButtonClick}
          >
            <ArrowIcon />
          </span>
        }
      </div>
    );
  }

  renderContent(props) {
    const className = classNames(props.className, {
      'expansion-panel-content': true,
    });
    return (
      <div className={className}>
        {props.children}
      </div>
    );
  }

  render() {
    const {
      border,
      children,
      either,
      id,
    } = this.props;
    const { open } = this.state;

    const className = classNames('expansion-panel', {
      border,
      collapsed: !open,
      either,
      expanded: open,
    });

    let headerProps;
    let contentProps;

    React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      const { displayName } = child.type;
      if (displayName === 'ExpansionPanelSection') {
        if (index === 0) headerProps = child.props;
        if (index === 1) contentProps = child.props;
      } else {
        return;
      }
    });

    return (
      <div {...{ id, className }}>
        {this.renderHeader(
          !(either && open) ? headerProps : contentProps,
          contentProps.children,
        )}
        {!either && this.renderContent(contentProps)}
      </div>
    );
  }
}
