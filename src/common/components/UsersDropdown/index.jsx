import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';

import Dropdown from 'common/components/Dropdown';

import * as UserAPI from 'common/api/user';

@translate('UsersDropdown')
export default class UsersDropdown extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    readonly: PropTypes.bool,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        email: PropTypes.string,
        displayName: PropTypes.string,
        avatar: PropTypes.string,
      })
    ),

    onChange: PropTypes.func,
  }

  static defaultProps = {
    fullWidth: false,
    disabled: false,
    readonly: false,
    users: [],
  }

  constructor(props) {
    super(props);
    this.state = {
      notFound: false,
      resultingUsers: [],
      selectedUsers: props.users || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selectedUsers: nextProps.users || [] });
  }

  componentWillUnmount() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  handleSearchInputChange = (value) => {
    if (value.length > 0) {
      this.setState({ notFound: false });
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        UserAPI.search(value).then((users) => {
          const { selectedUsers } = this.state;
          const resultingUsers = users.filter(user =>
            !(selectedUsers.find(selectedUser => selectedUser.id === user.id))
          );
          this.setState({
            notFound: resultingUsers.length === 0,
            resultingUsers,
          });
        }).catch(() => this.handleSearchInputChange());
      }, 200);
    } else {
      this.setState({
        notFound: false,
        resultingUsers: [],
      });
    }
  }

  handleChange = (selectedIndexes) => {
    const selectedUsers = [];
    const users = this.getUsers();
    selectedIndexes.forEach(index => {
      selectedUsers.push(users[index]);
    });
    this.setState({
      notFound: false,
      resultingUsers: [],
      selectedUsers,
    });
    if (this.props.onChange) this.props.onChange(selectedUsers);
  }

  getUsers() {
    const {
      selectedUsers,
      resultingUsers,
    } = this.state;
    return [...selectedUsers, ...resultingUsers];
  }

  render() {
    const {
      disabled,
      fullWidth,
      readonly,
      t,
    } = this.props;
    const {
      notFound,
      selectedUsers,
    } = this.state;

    const values = this.getUsers().map((user) => ({
      icon: user.avatar,
      text: user.displayName,
    }));
    const selectedIndexes = selectedUsers.map((user, index) => index);

    const className = classNames('users-dropdown', this.props.className);

    return (
      <Dropdown
        className={className}
        disabled={disabled}
        filter={false}
        fullWidth={fullWidth}
        placeholder={t(`${readonly ? 'label.noUser' : 'placeholder'}`)}
        readonly={readonly}
        searchNotFoundText={notFound ? t('label.userNotFound') : ''}
        selectedIndexes={selectedIndexes}
        values={values}
        multiple
        search
        onChange={this.handleChange}
        onDelete={this.handleChange}
        onSearchInputChange={this.handleSearchInputChange}
      />
    );
  }
}
