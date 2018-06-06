import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class ExpansionPanelGroup extends React.Component {
  static defaultProps = {
    value: -1,
    combined: false,
  }

  static propTypes = {
    children: PropTypes.node,
    combined: PropTypes.bool,
    value: PropTypes.number,
    onChange: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = { openedIndex: props.value };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ openedIndex: nextProps.value });
  }

  handleOnClickHeader = (index) => {
    const openedIndex = this.state.openedIndex !== index ? index : -1;
    if (this.props.onChange) this.props.onChange(openedIndex);
    this.setState({ openedIndex });
  }

  render() {
    const { id, combined } = this.props;
    const className = classNames('expansion-panel-group', {
      combined,
    });

    return (
      <div {...{ id, className }}>
        {React.Children.map(this.props.children, (child, index) => {
          if (React.isValidElement(child) && child.type.displayName === 'ExpansionPanel') {
            return React.cloneElement(child, {
              key: index,
              open: this.state.openedIndex === index,
              onClick: () => { this.handleOnClickHeader(index); },
            });
          }
          return null;
        })}
      </div>
    );
  }
}
