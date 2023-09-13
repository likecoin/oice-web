import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import LoadingScreen from 'ui-elements/LoadingScreen';
import SubNavBar from 'ui-elements/SubNavBar';
import TabBar from 'ui-elements/TabBar';

import SettingIcon from 'common/icons/setting';

import {
  redirectToLoginPage,
  redirectPathname,
} from 'common/utils/auth';

import PersonalInformationTab from './PersonalInformationTab';
import MembershipTab from './MembershipTab';
import AccountSettingTab from './AccountSettingTab';

import * as Actions from './Profile.actions';

import {
  PROFILE_ACTION,
  TAB_BAR_ITEM,
  TAB_BAR_ITEMS,
} from './Profile.constants';

import './Profile.styles.scss';


@connect(store => ({
  user: store.user,
  userProfile: store.Profile.userProfile,
}))
@translate(['general', 'Profile'])
export default class Profile extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    userProfile: PropTypes.object,
    location: PropTypes.object,
  }

  constructor(props) {
    super(props);

    let tabBarIndex = 2;
    switch (_get(props.location, 'query.action')) {
      case PROFILE_ACTION.PERSONAL_INFORMATION:
        tabBarIndex = 0;
        break;
      case PROFILE_ACTION.SUBSCRIBE:
      case PROFILE_ACTION.MEMBERSHIP:
        tabBarIndex = 1;
        break;
      case PROFILE_ACTION.BECOME_BACKER:
      case PROFILE_ACTION.BACKER_SUCCESS:
      case PROFILE_ACTION.BACKER_CANCEL:
        tabBarIndex = 2;
        break;
      default:
        break;
    }

    this.state = {
      tabBarIndex,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user.isAuthenticated) return;

    if (!nextProps.user.isLoggedIn) {
      redirectPathname.set(window.location.pathname + window.location.search);
      redirectToLoginPage();
    } else if (!nextProps.userProfile) {
      this.props.dispatch(Actions.updatedUserProfile(nextProps.user));
    }
  }

  handleClickTabBarItem = (tabBarIndex) => {
    this.setState({ tabBarIndex });
  }

  renderTabBar() {
    const { t } = this.props;
    const tabBarItems = TAB_BAR_ITEMS.map(item => ({
      text: t(`${item}.title`),
      icon: item === TAB_BAR_ITEM.ACCOUNT_SETTING ? <SettingIcon /> : undefined,
    }));

    return (
      <TabBar
        className="asset-library-dashboard-tabbar"
        items={tabBarItems}
        selectedIndex={this.state.tabBarIndex}
        onChange={this.handleClickTabBarItem}
      />
    );
  }

  renderTabChild() {
    const { tabBarIndex } = this.state;
    const settingType = TAB_BAR_ITEMS[tabBarIndex];
    const { action, referrer } = _get(this.props, 'location.query', {});

    switch (settingType) {
      case TAB_BAR_ITEM.PERSONAL_INFORMATION:
        return <PersonalInformationTab />;
      case TAB_BAR_ITEM.MEMBERSHIP:
        return <MembershipTab action={action} referrer={referrer} />;
      case TAB_BAR_ITEM.ACCOUNT_SETTING:
        return (
          <AccountSettingTab action={action} />
        );
      default:
        return null;
    }
  }

  render() {
    const { t, userProfile } = this.props;

    if (!userProfile) {
      return <LoadingScreen />;
    }

    return (
      <div id="profile-container">
        <SubNavBar text={t('title')} fluid />
        {this.renderTabBar()}
        {this.renderTabChild()}
      </div>
    );
  }
}
