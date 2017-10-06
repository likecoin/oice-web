import React from 'react';
import PropTypes from 'prop-types';

import _remove from 'lodash/remove';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';
import classNames from 'classnames';

import RightArrowIcon from 'common/icons/arrow/right';
import DownArrowIcon from 'common/icons/arrow/down';

import Tag from '../Tag';

import LegacyDropdown from './Dropdown';

import './style.scss';


const compareNumbersInAscendingOrder = (a, b) => a - b;

export default class Dropdown extends React.Component {
  static Legacy = LegacyDropdown

  static propTypes = {
    className: PropTypes.string,
    filter: PropTypes.bool,
    fullWidth: PropTypes.bool,
    id: PropTypes.string,
    limit: PropTypes.number,
    multiple: PropTypes.bool,
    placeholder: PropTypes.string,
    readonly: PropTypes.bool,
    search: PropTypes.bool,
    searchNotFoundText: PropTypes.string,
    selectedIndexes: PropTypes.arrayOf(PropTypes.number),
    showCount: PropTypes.bool,
    staticLabel: PropTypes.node,
    values: PropTypes.arrayOf(PropTypes.object),
    width: PropTypes.number,
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
    onSearchInputChange: PropTypes.func,
  }

  static defaultProps = {
    className: undefined,
    fullWidth: false,
    filter: true,
    id: undefined,
    limit: NaN,
    multiple: false,
    placeholder: '',
    readonly: false,
    search: false,
    searchNotFoundText: null,
    selectedIndexes: [],
    showCount: false,
    staticLabel: undefined,
    values: [],
    width: 380,
    onChange: undefined,
    onClick: undefined,
    onDelete: undefined,
    onSearchInputChange: undefined,
  }


  constructor(props) {
    super(props);
    this.state = {
      indexedValues: props.values.map((value, index) => ({ index, value })),
      open: false,
      searchInputWidth: 30,
      searchValue: '',
      selectedIndexes: props.selectedIndexes.sort(compareNumbersInAscendingOrder),
      upward: false,
    };
  }

  componentDidMount() {
    window.addEventListener('click', this.handleOutsideClick);
    this.resizeDebounce = _debounce(this.handleResize, 50);
    this.scrollThrottle = _throttle(this.handleScroll, 20);
    window.addEventListener('resize', this.resizeDebounce, true);
    window.addEventListener('scroll', this.scrollThrottle, true);
    this.positionFixedDropdownMenu();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.values && nextProps.selectedIndexes) {
      this.setState({
        indexedValues: nextProps.values.map((value, index) => ({ index, value })),
        selectedIndexes: nextProps.selectedIndexes.sort(compareNumbersInAscendingOrder),
      });
    }
    setTimeout(() => { this.positionFixedDropdownMenu(); }, 0);
  }

  componentWillUnmount() {
    if (this.resizeDebounce) this.resizeDebounce.cancel();
    if (this.scrollThrottle) this.scrollThrottle.cancel();
    window.removeEventListener('scroll', this.scrollThrottle);
    window.removeEventListener('resize', this.resizeDebounce);
    window.removeEventListener('click', this.handleOutsideClick);
  }

  setDropdownMenuToOppositeDirection() {
    const { upward } = this.state;
    this.setState({ upward: !upward });
  }

  onSelectMenuItem = (index) => {
    const selectedIndexes = [...this.state.selectedIndexes];
    if (!this.isFull() && this.state.open) {
      const { multiple, limit } = this.props;
      if (this.props.multiple) {
        selectedIndexes.push(index);
        selectedIndexes.sort(compareNumbersInAscendingOrder);
      } else {
        selectedIndexes[0] = index;
      }

      if (this.props.onChange) this.props.onChange(selectedIndexes);
      const open = multiple && selectedIndexes.length < limit;
      this.switchFixedDropdownMenuVisibility(open);
      this.setState({
        open,
        searchValue: '',
        selectedIndexes,
      });
    }
  }

  onDeleteMenuItem = (deletedIndex) => {
    const selectedIndexes = [...this.state.selectedIndexes];
    selectedIndexes.splice(deletedIndex, 0);
    _remove(selectedIndexes, index => index === deletedIndex);
    this.setState({ selectedIndexes });
    if (this.props.onDelete) this.props.onDelete(selectedIndexes, deletedIndex);
  }

  handleDropdownButtonClick = () => {
    if (this.props.staticLabel !== null && this.props.staticLabel !== undefined) {
      if (this.props.onClick) this.props.onClick();
    } else if (!this.isFull()) {
      const open = !this.state.open;
      if (open) { this.positionFixedDropdownMenu(); }
      this.switchFixedDropdownMenuVisibility(open);
      this.setState({ open });
      if (open && this.searchInput) this.searchInput.focus();
    }
  }

  handleOutsideClick = ({ target }) => {
    if (!this.component.contains(target) && this.state.open) {
      this.setState({ open: false, searchValue: '' });
      this.switchFixedDropdownMenuVisibility(false);
    }
    this.positionFixedDropdownMenu();
  }

  handleSearchInputChange = ({ target }) => {
    const searchValue = target.value.toLowerCase().trim();
    this.setState({
      open: true,
      searchInputWidth: (searchValue.length > 0 ? this.searchInputSizer.clientWidth : 0) + 30,
      searchValue,
    });
    if (this.props.onSearchInputChange) this.props.onSearchInputChange(searchValue);
    setTimeout(() => {
      this.positionFixedDropdownMenu();
    }, 100);
  }

  handleScroll = ({ target }) => {
    if (this.dropdownButton) {
      this.positionFixedDropdownMenu();
    }
  }

  handleResize = ({ target }) => {
    if (this.dropdownButton) {
      this.positionFixedDropdownMenu();
    }
  }

  isFull = () => {
    const { limit } = this.props;
    return !isNaN(limit) && this.state.selectedIndexes.length >= limit;
  }

  positionFixedDropdownMenu() {
    if (!this.fixedDropdownMenu || !this.dropdownButton) return;
    // determine direction of dropdown menu
    const { upward, selectedIndexes } = this.state;

    const bodyRect = document.body.getBoundingClientRect();
    const buttonRect = this.dropdownButton.getBoundingClientRect();

    let isDirectionUp = upward;
    // determine up / down
    if (buttonRect.bottom + 180 > bodyRect.height) {
      if (!isDirectionUp) {
        isDirectionUp = true;
        this.setDropdownMenuToOppositeDirection();
      }
    } else if (isDirectionUp) {
      isDirectionUp = false;
      this.setDropdownMenuToOppositeDirection();
    }

    // reposition only when dropdown menu is open
    if (!this.state.open || this.props.staticLabel) return;

    if (isDirectionUp) {
      // menu height determine by # of values and hardcoded height (because real time is too slow to capture correct height)
      let menuHeight = 168;
      const numRemains = this.props.values.length - selectedIndexes.length;
      if (numRemains <= 4) {
        if (this.props.search) {
          const baseHeight = document.querySelector('.dropdown-menu-item.not-found') ? 36 : 0;
          menuHeight = (this.state.searchValue.length > 0) ? baseHeight + Math.max(0, ((numRemains - 1) * 36)) : 0;
        } else {
          menuHeight = numRemains * 36;
        }
      }
      const offsetY = buttonRect.top - menuHeight;
      const offsetX = buttonRect.left;
      this.fixedDropdownMenu.style.top = `${offsetY + 1}px`;
      this.fixedDropdownMenu.style.left = `${offsetX}px`;
      this.fixedDropdownMenu.style.width = `${buttonRect.width}px`;
      this.fixedDropdownMenu.style.height = `${menuHeight}px`;
    } else {
      const offsetY = buttonRect.top + buttonRect.height;
      const offsetX = buttonRect.left;
      this.fixedDropdownMenu.style.top = `${offsetY}px`;
      this.fixedDropdownMenu.style.left = `${offsetX}px`;
      this.fixedDropdownMenu.style.width = `${buttonRect.width}px`;
    }
  }

  switchFixedDropdownMenuVisibility(open) {
    if (open) {
      setTimeout(() => { this.fixedDropdownMenu.style.visibility = 'initial'; }, 150);
    } else {
      this.fixedDropdownMenu.style.visibility = 'hidden';
    }
  }

  renderDropdownButton = (selectedIndexedValues) => {
    const {
      multiple,
      readonly,
      search,
      showCount,
      staticLabel,
    } = this.props;
    const {
      searchInputWidth,
      searchValue,
    } = this.state;
    const className = classNames('dropdown-button', {
      active: this.state.open,
      'up-head': this.state.upward,
    });

    return (
      <div
        ref={ref => this.dropdownButton = ref}
        {...{ className }}
        style={{ cursor: search ? 'text' : 'pointer' }}
        onClick={this.handleDropdownButtonClick}
      >
        {staticLabel &&
          <div className="selected-value-label">
            {this.props.staticLabel}
          </div>
        }
        {selectedIndexedValues.map(({ index, value }, mapIndex) => (
          multiple ? (
            <Tag
              key={mapIndex}
              canDelete={!readonly}
              icon={value.icon}
              value={value.text}
              onClick={() => this.onDeleteMenuItem(index)}
            />
          ) : (
            <div key={mapIndex} className="selected-value-row">
              {value.icon &&
                <div
                  className="selected-value-icon"
                  style={{ backgroundImage: `url('${value.icon}')` }}
                />
              }
              <div className="selected-value-label">
                {value.text}
              </div>
            </div>
          )
        ))}
        {!staticLabel &&
          selectedIndexedValues.length === 0 &&
          searchValue.length === 0 && (
            <div className="placeholder">{this.props.placeholder}</div>
          )}
        {multiple && search && !this.isFull() &&
          <input
            ref={ref => this.searchInput = ref}
            className="search-input"
            style={{ width: `${searchInputWidth}px` }}
            type="text"
            value={searchValue}
            onChange={this.handleSearchInputChange}
          />
        }
        {search &&
          <span
            ref={ref => this.searchInputSizer = ref}
            className="search-input-sizer"
          >
            {searchValue}
          </span>
        }
        {showCount &&
          <span className="selected-count-label">
            {`${selectedIndexedValues.length}/${this.props.limit}`}
          </span>
        }
        {!readonly &&
          <DownArrowIcon
            className="dropdown-icon"
            style={{ opacity: this.isFull() ? 0.3 : 1 }}
          />
        }
      </div>
    );
  }

  renderDropdownMenu(unselectedIndexedValues, fixed = false) {
    const { searchValue } = this.state;
    const { filter, searchNotFoundText } = this.props;

    let filteredUnselectedIndexedValues = [];
    if (searchValue.length > 0) {
      unselectedIndexedValues.forEach((indexedValue) => {
        const result = new RegExp(`${searchValue}`, 'i').test(indexedValue.value.text);
        if (!filter || result) filteredUnselectedIndexedValues.push(indexedValue);
      });
    } else {
      filteredUnselectedIndexedValues = unselectedIndexedValues;
    }
    const className = classNames('dropdown-menu', {
      'up-head': this.state.upward,
      fixed,
    });
    return (
      <div
        {...{ className }}
        ref={(ref) => {
          if (fixed) {
            this.fixedDropdownMenu = ref;
          }
        }}
      >
        {!this.props.staticLabel && (
          filteredUnselectedIndexedValues.map(({ index, value }, mapIndex) => (
            <div
              key={mapIndex}
              className="dropdown-menu-row-item"
            >
              {value.icon && <div className="dropdown-icon-image" style={{ backgroundImage: `url('${value.icon}')` }} />}
              <div
                className="dropdown-menu-item"
                onClick={() => this.onSelectMenuItem(index)}
              >
                {value.text}
              </div>
            </div>
          ))
        )}
        {searchValue.length > 0 &&
          filteredUnselectedIndexedValues.length === 0 &&
          searchNotFoundText && (
            <div className="dropdown-menu-item not-found">
              {searchNotFoundText}
            </div>
          )}
      </div>
    );
  }

  render() {
    const {
      fullWidth,
      id,
      readonly,
      staticLabel,
      width,
    } = this.props;
    const {
      indexedValues,
      open,
      selectedIndexes,
    } = this.state;
    const className = classNames('dropdown', this.props.className, {
      active: open,
      block: fullWidth,
      readonly,
      static: staticLabel,
    });
    const style = {};
    if (!fullWidth) {
      style.width = `${width}px`;
    }

    const selectedIndexedValues = [];
    const unselectedIndexedValues = [];

    let iterateIndex = 0;
    indexedValues.forEach((indexedValue) => {
      if (selectedIndexes.includes(indexedValue.index, iterateIndex)) {
        selectedIndexedValues.push(indexedValue);
        iterateIndex++;
      } else {
        unselectedIndexedValues.push(indexedValue);
      }
    });

    return (
      <div
        ref={ref => this.component = ref}
        {...{ id, className, style }}
      >
        {this.renderDropdownButton(selectedIndexedValues)}
        {this.renderDropdownMenu(unselectedIndexedValues)}
        {/* only render when there is options */}
        {!staticLabel && this.renderDropdownMenu(unselectedIndexedValues, true)}
      </div>
    );
  }
}
