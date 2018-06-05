import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import _get from 'lodash/get';

import ArrowDownIcon from 'common/icons/arrow/down';

import './Switcher.style.scss';

export default class Switcher extends React.Component {
  static propTypes = {
    values: PropTypes.array.isRequired,
    actionTitle: PropTypes.string,
    disabled: PropTypes.bool,
    label: PropTypes.string,
    selectedIndex: PropTypes.number,
    onChange: PropTypes.func,
    onClickAction: PropTypes.func,
  }

  static defaultProps = {
    actionTitle: undefined,
    disabled: false,
    onClickAction: undefined,
    onChange: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { values, selectedIndex } = nextProps;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.open) {
      // listen to outside click event
      this.toggleOutsideClickEvent(true);

      // update position for the optionWrapper
      if (this.switcherButton && this.optionWrapper) {
        const { clientWidth, clientHeight } = this.switcherButton;
        this.optionWrapper.style.width = `${clientWidth - 20}px`;
        this.optionWrapper.style.top = `${clientHeight}px`;
      }
    } else {
      this.toggleOutsideClickEvent(false);
    }
  }

  handleClickSwitcherButton = () => {
    const open = !this.state.open;
    this.setState({ open });
  }

  handleClickOption = (selectedIndex) => {
    this.setState({ open: false });
    const { onChange } = this.props;
    if (onChange) onChange(selectedIndex);
  }

  handleOutsideClick = ({ target }) => {
    if (this.component && !this.component.contains(target)) {
      this.setState({ open: false });
    }
  }

  handleClickActionButton = () => {
    const { onClickAction } = this.props;
    this.setState({ open: false });
    if (onClickAction) onClickAction();
  }

  toggleOutsideClickEvent(enabled) {
    if (enabled) {
      document.addEventListener('click', this.handleOutsideClick);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  renderSwitcherButton() {
    const { label, values, selectedIndex } = this.props;
    return (
      <div
        ref={ref => this.switcherButton = ref}
        className="switcher-button"
        onClick={this.handleClickSwitcherButton}
      >
        <span>{label}</span>
        <span>{values[selectedIndex]}</span>
        <ArrowDownIcon
          className="dropdown-icon"
        />
      </div>
    );
  }

  renderOptions() {
    const { selectedIndex, values } = this.props;
    const optionWrapperStyle = this.state.open ? {} : { display: 'none' };

    return (
      <div
        ref={ref => this.optionWrapper = ref}
        className="switcher-option-wrapper"
        style={optionWrapperStyle}
      >
        {values.map((value, index) => (index !== selectedIndex &&
          <div
            key={index}
            className="switcher-option"
            onClick={() => this.handleClickOption(index)}
          >
            {value}
          </div>
        ))}
        {this.renderAction()}
      </div>
    );
  }

  renderAction() {
    const { actionTitle } = this.props;
    if (!actionTitle) return null;
    return (
      <div className="switcher-action" onClick={this.handleClickActionButton}>
        {actionTitle}
      </div>
    );
  }

  render() {
    const { open } = this.state;
    const className = classNames('switcher', {
      disabled: this.props.disabled,
      open,
    });

    return (
      <div
        ref={ref => this.component = ref}
        className={className}
      >
        {this.renderSwitcherButton()}
        {this.renderOptions()}
      </div>
    );
  }
}
