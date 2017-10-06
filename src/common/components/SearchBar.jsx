import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class SearchBar extends React.Component {
  // static defaultProps = {
  //
  // }
  static propTypes = {
    onSearch: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  onChange = (e) => {
    const value = e.target.value;
    console.log('search-bar value:', value);
    this.setState({ value });
  }

  onSearch = (e) => {
    e.preventDefault();
    this.search();
  }

  search() {
    if (!this.state.value) return;
    const value = this.state.value.toLowerCase().trim();
    if (this.props.onSearch) {
      this.props.onSearch(value);
    }
  }

  render() {
    // const {
    //
    // } = this.props;

    const className = classNames({
      'search-bar': true,
    });

    return (
      <div className="search-bar">
        <input
          type="text"
          name="search"
          placeholder="搜索"
          value={this.state.value}
          onChange={this.onChange}
        />
        <input
          className="icon search-bar-submit"
          type="submit"
          onClick={this.onSearch}
        />
      </div>
    );
  }
}
