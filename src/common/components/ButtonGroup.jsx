import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class ButtonGroup extends React.Component {
  static defaultProps = {
    fullWidth: false,
    selectable: false,
    disabled: false,
    selectedIndex: 0,
  }

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    id: PropTypes.string,
    selectable: PropTypes.bool,
    selectedIndex: PropTypes.number,
    onChange: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: props.selectedIndex,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selectedIndex: nextProps.selectedIndex });
  }

  handleButtonClick = (event, selectedIndex) => {
    this.setState({ selectedIndex });
    if (this.props.onChange) this.props.onChange(selectedIndex);
  }

  createButton(element, index) {
    const { selectable, disabled } = this.props;
    const { selectedIndex } = this.state;
    return React.cloneElement(element, {
      key: index,
      buttonGroupIndex: index,
      selected: selectedIndex === index && selectable,
      onClick: element.props.onClick || this.handleButtonClick,
      disabled: element.props.disabled || disabled,
    });
  }

  render() {
    const {
      children,
      fullWidth,
      id,
      selectable,
    } = this.props;
    const buttons = [];

    // Inject props into children
    React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      const { displayName } = child.type;
      if (displayName === 'RaisedButton' || displayName === 'FlatButton') {
        buttons.push(this.createButton(child, index));
      }
    });

    const className = classNames(
      'button-group',
      this.props.className,
      {
        block: fullWidth,
        selectable,
      }
    );

    return (
      <div {...{ className }}>
        {buttons}
      </div>
    );
  }
}
