import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Link } from 'react-router';

import classNames from 'classnames';

import Container from 'ui-elements/Container';
import Divider from 'ui-elements/Divider';
import Dropdown from 'ui-elements/Dropdown';
import FlatButton from 'ui-elements/FlatButton';
import OutlineButton from 'ui-elements/OutlineButton';
import Menu from 'ui-elements/Menu';
import RaisedButton from 'ui-elements/RaisedButton';

import OiceLogo from 'common/icons/oice-logo-full-color';
import SettingIcon from 'common/icons/setting';
import I18nIcon from 'common/icons/i18n';

import { getLastEditingOice } from 'common/utils/editor';
import { signOut } from 'common/actions/user';

import { isMobileAgent } from 'common/utils';
import i18next, { mapLanguageCode } from 'common/utils/i18n';

import LANGUAGE_LIST from 'common/constants/i18n';

import './styles.scss';


const NAV_ITEMS = [
  {
    id: 'editor',
    isEditor: true,
    path: '/edit/dashboard',
  },
  {
    id: 'asset',
    isEditor: false,
    path: '/store',
  },
  {
    id: 'about',
    isEditor: false,
    path: '/about',
  },
];

@translate('NavBar')
@connect()
export default class NavBar extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    fixed: PropTypes.bool,
    fluid: PropTypes.bool,
    iconMenu: PropTypes.node, // Deprecated
    id: PropTypes.string,
    rightChildren: PropTypes.node,
    showLogo: PropTypes.bool,
    user: PropTypes.object,
  }

  static defaultProps = {
    className: undefined,
    fluid: false,
    id: undefined,
    showLogo: true,
    rightChildren: undefined,
  }

  static contextTypes = {
    appModule: PropTypes.string,
    module: PropTypes.string,
  }

  handleClickProfile = () => window.location.pathname = '/user';

  handleClickAccountSetting = () => window.location.pathname = '/profile';

  handleClickLogout = () => {
    this.props.dispatch(signOut());
  }

  handleClickRegisterButton = () => window.location.pathname = '/edit/dashboard';

  handleI18nChange = (languageCode) => {
    i18next.changeLanguage(languageCode, () => {
      // Reload the page after setting language
      window.location.reload();
    });
  }

  renderLogo(user) {
    if (!this.props.showLogo) return null;

    const { appModule } = this.context;

    const props = {
      alt: 'oice',
      children: <OiceLogo />,
      id: 'logo',
    };

    if (user.isLoggedIn) {
      if (isMobileAgent()) {
        return <a {...props} href="/about" />;
      }
      if (appModule === 'edit') {
        return <Link {...props} to="/dashboard" />;
      }
      return <a {...props} href="/edit/dashboard" />;
    }

    return <a {...props} href="/" />;
  }

  renderNavItem = (navItem, index) => {
    const { t } = this.props;
    const { appModule } = this.context;
    const { id, isEditor, title } = navItem;

    const label = title || t(`menu.${id}`);
    const path = (
      appModule === 'edit' ?
        navItem.path.replace('/edit', '') :
        navItem.path
    );

    let active = this.context.module === id;
    if (!active && id === 'about' && /\/about$/.test(window.location.pathname)) {
      active = true;
    }
    const className = classNames('nav-link', id, { active });

    const props = { className, children: label };

    return (
      <li key={index}>
        {appModule === 'edit' && isEditor ? (
          <Link {...props} to={path} />
        ) : (
          <a {...props} href={path} />
        )}
      </li>
    );
  }

  renderLeftItems(user) {
    const { children, t } = this.props;
    return (
      <div className="nav-bar-left-items">
        {this.renderLogo(user)}
        {children || (user.isLoggedIn &&
          <ul>{NAV_ITEMS.map(this.renderNavItem)}</ul>
        )}
      </div>
    );
  }

  renderContinueEdit() {
    const { t } = this.props;
    const oice = getLastEditingOice();
    return oice && this.renderNavItem({
      id: 'continue-edit',
      isEditor: true,
      path: `/edit/story/${oice.storyId}/oice/${oice.id}`,
      title: t('menu.continueEditLastOice'),
    });
  }

  renderLanguageSwitcher = () => (
    <Dropdown.Legacy
      leftIcon={<I18nIcon />}
      options={LANGUAGE_LIST}
      value={mapLanguageCode(i18next.language)}
      onChange={this.handleI18nChange}
    />
  );

  renderRightItems(user) {
    const {
      children, rightChildren, iconMenu, t,
    } = this.props;
    return (
      <div className="nav-bar-right-items">
        {!children && user.isLoggedIn &&
          <ul>{this.renderContinueEdit()}</ul>
        }
        {/* Deprecated */}
        {rightChildren}
        {iconMenu}
        {iconMenu && <hr className="setting-menu-hr" />}
        {user.isLoggedIn ? (
          <Menu anchorEl={this.renderProfileIcon()}>
            <Divider />
            <Menu.Item
              primaryText={t('dropdownMenu.profile')}
              onClick={this.handleClickProfile}
            />
            <Menu.Item
              icon={<SettingIcon />}
              primaryText={t('dropdownMenu.accountSetting')}
              onClick={this.handleClickAccountSetting}
            />
            <Menu.Item
              primaryText={t('dropdownMenu.logout')}
              onClick={this.handleClickLogout}
            />
          </Menu>
        ) : (
          <div className="auth-button-group">
            <FlatButton
              label={t('button.login')}
              onClick={this.handleClickRegisterButton}
            />
            <OutlineButton
              label={t('button.register')}
              width={136}
              onClick={this.handleClickRegisterButton}
            />
          </div>
        )}
        {!user.isLoggedIn && <hr />}
        {!user.isLoggedIn && this.renderLanguageSwitcher()}
      </div>
    );
  }

  renderProfileIcon() {
    const { user } = this.props;
    return (
      <div className="profile-icon">
        <img
          alt="profile"
          className="profile-picture"
          src={(user && user.avatar) || '/static/img/avatar.jpg'}
        />
      </div>
    );
  }

  render() {
    const {
      fixed, fluid, id, user,
    } = this.props;

    const className = classNames(
      'nav-bar',
      this.props.className,
      this.context.module,
      {
        fixed,
      }
    );

    return (
      <Container {...{ id, className, fluid }}>
        {this.renderLeftItems(user)}
        {user.isAuthenticated && this.renderRightItems(user)}
      </Container>
    );
  }
}
