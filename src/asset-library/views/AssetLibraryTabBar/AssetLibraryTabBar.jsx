import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import TabBar from 'ui-elements/TabBar';

import StoreSmallIcon from 'common/icons/store-small-icon';
import StoreSamllActiveIcon from 'common/icons/store-small-icon-active';

import { TAB_BAR_ITEM_LIST } from 'asset-library/constants';
import * as Actions from './AssetLibraryTabBar.actions';


function AssetLibraryTabBar(props) {
  const { dispatch, t, value, loggedIn } = props;

  let selectedTabBarIndex = 0;
  const tabBarItems = TAB_BAR_ITEM_LIST.map((TAB_BAR_ITEM, index) => {
    if (value.key === TAB_BAR_ITEM.key) {
      selectedTabBarIndex = index;
    }
    let icon;
    let disabled = !loggedIn;
    const storeIndex = TAB_BAR_ITEM_LIST.length - 1;
    if (index === storeIndex) {
      icon = (selectedTabBarIndex === storeIndex) ? <StoreSamllActiveIcon /> : <StoreSmallIcon />;
      disabled = false;
    }
    return {
      text: t(`tabBar.${TAB_BAR_ITEM.key}`),
      disabled,
      icon,
    };
  });

  function handleClickTabBarItem(index) {
    const tabBarItem = TAB_BAR_ITEM_LIST[index];
    dispatch(Actions.changeValue(tabBarItem));
  }

  return (
    <TabBar
      className="asset-library-dashboard-tabbar"
      items={tabBarItems}
      selectedIndex={selectedTabBarIndex}
      onChange={handleClickTabBarItem}
    />
  );
}

AssetLibraryTabBar.propTypes = {
  dispatch: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool,
};

AssetLibraryTabBar.defaultProps = {
  loggedIn: true,
};

export default connect(store => ({ ...store.AssetLibraryTabBar }))(
  translate('LibraryDashboard')(AssetLibraryTabBar)
);
