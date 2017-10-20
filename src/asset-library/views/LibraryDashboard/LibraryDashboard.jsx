import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';
import TabBar from 'ui-elements/TabBar';

import SettingIcon from 'common/icons/setting';
import StoreSmallIcon from 'common/icons/store-small-icon';
import StoreSmallActiveIcon from 'common/icons/store-small-icon-active';

import {
  actions as CreateLibraryModalActions,
} from 'asset-library/views/CreateLibraryModal';
import {
  actions as AssetLibraryTabBarActions,
} from 'asset-library/views/AssetLibraryTabBar';
import {
  updateUserTutorialState,
} from 'editor/components/InteractiveTutorial/actions';

import {
  LIBRARY_ACTION,
  LIBRARY_TYPE,
  TAB_BAR_ITEM,
} from 'asset-library/constants';
import { isNormalUser } from 'common/utils/user';

import CreateLibraryModal from '../CreateLibraryModal';
import MyLibraryDashboard from '../MyLibraryDashboard';
import PurchasedLibraryDashboard from '../PurchasedLibraryDashboard';
import AssetStore from '../AssetStore';

import * as Actions from './LibraryDashboard.actions';
import './LibraryDashboard.style.scss';


@translate('LibraryDashboard')
@connect((store) => {
  const { routing, LibraryDashboard, LibraryDetails, AssetLibraryTabBar, user } = store;
  const isFirstEnter = _get(routing, 'locationBeforeTransitions.action', 'POP') === 'POP';
  const hasFetchedUserLibraries = LibraryDashboard.public.libraries.length > 0;
  return {
    hasFetchedUserLibraries,
    isFirstEnter,
    tabBarValue: AssetLibraryTabBar.value,
    user,
  };
})
export default class LibraryDashboard extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isFirstEnter: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    tabBarValue: PropTypes.object.isRequired,
    children: PropTypes.node,
    hasFetchedUserLibraries: PropTypes.bool,
    user: PropTypes.object,
  }

  static defaultProps = {
    children: undefined,
    hasFetchedUserLibraries: undefined,
    user: undefined,
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedTabBarIndex: props.route.isStore ? 2 : 0,
      libraryType: undefined,
    };
  }

  componentDidMount() {
    if (this.props.user.isAuthenticated && this.props.user.isLoggedIn) {
      this.fetchLibraries();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.route.isStore !== this.props.route.isStore) {
      if (nextProps.route.isStore) {
        let redirectPath = '';
        const { libraryId } = this.props.params;
        if (libraryId) redirectPath = `/library/${libraryId}`;
        if (this.state.selectedTabBarIndex !== 2) {
          this.props.dispatch(push(`/store${redirectPath}`));
        }
        this.setState({ selectedTabBarIndex: 2 });
      } else if (this.state.selectedTabBarIndex === 2) {
        this.props.dispatch(push('/asset'));
        this.fetchLibraries();
      }
    }

    if (!nextProps.route.isStore) {
      this.fetchLibraries(nextProps);
    }

    if (nextProps.user.isAuthenticated && nextProps.user.isLoggedIn) {
      // check action
      const { query } = nextProps.location;
      switch (query.action) {
        case LIBRARY_ACTION.ADD_SALE_LIBRARY:
          this.handleActionAddSaleLibrary(_get(nextProps, 'user.isStripeConnected'));
          break;
        case LIBRARY_ACTION.ADD_PRIVATE_LIBRARY:
          this.handleActionAddPrivateLibrary(_get(nextProps, 'user.role'));
          break;
        case LIBRARY_ACTION.START_TUTORIAL: {
          const { volume, index } = query;
          this.handleActionStartTutorial(volume, index);
          break;
        }
        default: break;
      }
    }
  }

  fetchLibraries(props = this.props, types) {
    const { user, hasFetchedUserLibraries } = props;
    if (user.isLoggedIn && !hasFetchedUserLibraries) {
      this.props.dispatch(Actions.fetchLibraries(types));
    }
  }

  handleRequestFetchLibraries = (types) => {
    this.fetchLibraries(types);
  }

  handleRequestCloseLibraryDetails = (libraryId) => {
    const { tabBarValue } = this.props;
    this.props.dispatch(push(tabBarValue.path));
  }

  handleOnClickAssetStoreButton = () => {
    this.props.dispatch(
      AssetLibraryTabBarActions.changeValue(TAB_BAR_ITEM.ASSET_STORE)
    );
  }

  handleToggleCreateLibraryModal = () => {
    const { dispatch, location } = this.props;
    if (
      (location.query.action === LIBRARY_ACTION.ADD_SALE_LIBRARY) ||
      (location.query.action === LIBRARY_ACTION.ADD_PRIVATE_LIBRARY)
    ) {
      dispatch(push('/asset'));
      this.setState({ libraryType: undefined });
    }
    dispatch(InteractiveTutorial.Action.achieve(['e1626fe']));
    dispatch(
      CreateLibraryModalActions.toggleCreateLibraryModal()
    );
  }

  handleActionAddSaleLibrary = (isStripeConnected) => {
    if (!this.state.libraryType && isStripeConnected) {
      this.setState({ libraryType: LIBRARY_TYPE.FORSALE });
      this.props.dispatch(CreateLibraryModalActions.toggleCreateLibraryModal());
    }
  }

  handleActionAddPrivateLibrary = (role) => {
    if (!this.state.libraryType && !isNormalUser(role)) {
      this.setState({ libraryType: LIBRARY_TYPE.PRIVATE });
      this.props.dispatch(CreateLibraryModalActions.toggleCreateLibraryModal());
    }
  }

  handleActionStartTutorial = (volume, index) => {
    if (volume && index) {
      const { dispatch, user } = this.props;
      dispatch(InteractiveTutorial.Action.open(volume, 'e1626fe'));
      dispatch(updateUserTutorialState(index));
      dispatch(push('/asset'));
    }
  }

  render() {
    const { isFirstEnter, t, params, tabBarValue } = this.props;

    const { selectedTabBarIndex, libraryType } = this.state;

    // Determine the children whether appear in modal or not
    let libraryDetails;
    React.Children.forEach(
      this.props.children,
      (child) => {
        // Assuming LibraryDetails is the only child
        if (!libraryDetails) {
          libraryDetails = React.cloneElement(child, {
            modal: !isFirstEnter && !params.collectionId,
          });
        }
      }
    );

    if (libraryDetails && isFirstEnter) {
      return libraryDetails;
    }

    switch (tabBarValue.key) {
      case TAB_BAR_ITEM.MY_LIBRARIES.key:
        return (
          <div>
            <MyLibraryDashboard
              children={libraryDetails}
              location={this.props.location}
              onClickAddLibraryButton={this.handleToggleCreateLibraryModal}
              onRequestFetchLibraries={this.handleRequestFetchLibraries}
            />
            <CreateLibraryModal
              libraryType={libraryType}
              onClickCloseButton={this.handleToggleCreateLibraryModal}
              onClickOutside={this.handleToggleCreateLibraryModal}
            />
          </div>
        );
      case TAB_BAR_ITEM.PURCHASED_LIBRARIES.key:
        return (
          <PurchasedLibraryDashboard
            children={libraryDetails}
            onClickAssetStore={this.handleOnClickAssetStoreButton}
            onRequestFetchLibraries={this.handleRequestFetchLibraries}
          />
        );
      case TAB_BAR_ITEM.ASSET_STORE.key:
        return (
          <AssetStore
            children={libraryDetails}
            params={params}
          />
        );
      default:
        return null;
    }
  }
}
