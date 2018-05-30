import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';

import { forceCheck } from 'react-lazyload';

import classNames from 'classnames';
import _get from 'lodash/get';
import _maxBy from 'lodash/maxBy';
import _throttle from 'lodash/throttle';
import _unescape from 'lodash/unescape';

import AlertDialog from 'ui-elements/AlertDialog';
import AudioUpload from 'ui-elements/AudioUpload';
import Container from 'ui-elements/Container';
import FlatButton from 'ui-elements/FlatButton';
import Progress from 'ui-elements/Progress';
import SubNavBar from 'ui-elements/SubNavBar';
import TabBar from 'ui-elements/TabBar';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import CloseIcon from 'common/icons/close-bold';
import SettingIcon from 'common/icons/setting';

import * as ASSET_TYPES from 'common/constants/assetTypes';
import { LIBRARY_TYPE } from 'asset-library/constants';

import AssetGridList from 'asset-library/views/AssetGridList';
import LoginModal from 'asset-library/views/LoginModal';
import BackgroundModal, { actions as BackgroundModalActions }
from 'asset-library/views/BackgroundModal';
import CharacterModal, { actions as CharacterModalActions }
from 'asset-library/views/CharacterModal';
import ItemModal, { actions as ItemModalActions }
from 'asset-library/views/ItemModal';
import UploadAudioAssetModal, { actions as UploadAudioAssetModalActions }
from 'asset-library/views/UploadAudioAssetModal';
import EditAudioAssetModal, { actions as EditAudioAssetModalActions }
from 'asset-library/views/EditAudioAssetModal';
import CreateLibraryModal, { actions as CreateLibraryModalActions }
from '../CreateLibraryModal';

import LibraryInfo from './LibraryInfo';

import * as Actions from './LibraryDetails.actions';
import {
  actions as PurchasedLibraryActions,
} from 'asset-library/views/PurchasedLibraryDashboard';

import { USER_ROLE_NORMAL, USER_ROLE_ADMIN } from 'common/constants/userRoles';
import { isNormalUser } from 'common/utils/user';

import './LibraryDetails.style.scss';


function getStateFromProps(props) {
  const { library, user } = props;
  const state = {};

  if (library) {
    if (user && library.author && library.author.id === user.id) {
      state.mode = 'owned';
    } else if (library.isPurchased) {
      state.mode = 'purchased';
    } else if (library.price === 0) {
      state.mode = 'free';
    } else if (library.price > 0) {
      state.mode = 'paid';
    }
  }

  return state;
}

function getIsOwnedFromProps({ library }) {
  return _get(library, 'isCollaborator');
}

function getIsEditableFromProps(props) {
  const { library, user } = props;
  if (user.role === USER_ROLE_ADMIN) {
    return true;
  } else if (getIsOwnedFromProps(props)) {
    return _get(library, 'price', -1) >= 0 || !isNormalUser(user.role);
  }
  return false;
}

function getIsEditFromProps(props) {
  const { route } = props;
  return route.isEdit && getIsEditableFromProps(props);
}

const AssetGroupPropType = PropTypes.shape({
  items: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
}).isRequired;

@translate(['library', 'LibraryDetails'])
@connect(store => ({
  ...store.LibraryDetails,
  ...store.PurchasedLibraryDashboard,
  user: store.user,
}))
export default class LibraryDetails extends React.Component {
  static propTypes = {
    assets: PropTypes.shape({
      [ASSET_TYPES.CHARACTER]: AssetGroupPropType,
      [ASSET_TYPES.BACKGROUND]: AssetGroupPropType,
      [ASSET_TYPES.ITEM]: AssetGroupPropType,
      [ASSET_TYPES.MUSIC]: AssetGroupPropType,
      [ASSET_TYPES.SOUND]: AssetGroupPropType,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
    loaded: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    library: PropTypes.object,
    modal: PropTypes.bool,
    purchasing: PropTypes.bool,
    togglingLibraryId: PropTypes.number,
    user: PropTypes.object,
  }

  static defaultProps = {
    library: null,
    modal: false,
    user: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedTabBarIndex: 0,
      loginModalOpen: false,
      ...getStateFromProps(props),
    };

    this.scrollThrottle = _throttle(this.handleScroll, 500);

    console.info('LibraryDetails\n-params%o\n-route%o', props.params, props.route);
  }

  componentDidMount() {
    const { libraryId } = this.props.params;
    this.fetchDetails(libraryId);
    ASSET_TYPES.LIST.forEach(assetType => this.fetchAssets(this.props, assetType));

    if (!this.props.modal) {
      window.addEventListener('scroll', this.scrollThrottle);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, params, library, user } = nextProps;
    const { libraryId } = params;

    // Fetch library details when change library
    // Fetch all types of assets when library changes
    if (libraryId !== this.props.params.libraryId) {
      this.fetchDetails(libraryId);
      ASSET_TYPES.LIST.forEach(assetType => this.fetchAssets(nextProps, assetType));
    }

    if (!loaded) return;

    // The following actions will execute when details are loaded

    const newState = getStateFromProps(nextProps);

    if (nextProps.route.isEdit) {
      // Redirect if the user does not have right to the edit the library
      if (!getIsEditableFromProps(nextProps)) {
        this.props.dispatch(push('/asset'));
        return;
      }
    } else if (!nextProps.modal && !nextProps.route.isStore && !getIsOwnedFromProps(nextProps)) {
      // Redirect to store when entering as full page
      this.props.dispatch(push(`/store/library/${libraryId}`));
      return;
    }

    // Switch asset type if current type does not have any asset
    const selectedAssetType = ASSET_TYPES.LIST[this.state.selectedTabBarIndex];
    const numOfAssetsInSelectedType = nextProps.assets[selectedAssetType].items.length;
    if (numOfAssetsInSelectedType === 0) {
      const isPrevAssetsLoaded = ASSET_TYPES.LIST.every(type => this.props.assets[type].loaded);
      const isNextAssetsLoaded = ASSET_TYPES.LIST.every(type => nextProps.assets[type].loaded);
      if (isPrevAssetsLoaded !== isNextAssetsLoaded) {
        const maxAssetType = _maxBy(ASSET_TYPES.LIST, type => nextProps.assets[type].items.length);
        const selectedTabBarIndex = ASSET_TYPES.LIST.findIndex(type => type === maxAssetType);
        newState.selectedTabBarIndex = selectedTabBarIndex;
      }
    }

    this.setState(newState);
  }

  getLibraryType() {
    const { library } = this.props;
    let libraryType;
    switch (_get(library, 'price')) {
      case 0:
        libraryType = LIBRARY_TYPE.PUBLIC;
        break;
      case -1:
        libraryType = LIBRARY_TYPE.PRIVATE;
        break;
      default:
        libraryType = LIBRARY_TYPE.FORSALE;
        break;
    }
    return libraryType;
  }

  fetchDetails(libraryId) {
    const { dispatch } = this.props;
    dispatch(Actions.fetchStoreLibraryDetails(libraryId));
  }

  fetchAssets(props, assetType) {
    const { dispatch, library, params } = props;
    const libraryId = library ? library.id : params.libraryId;
    if (getIsOwnedFromProps(props)) {
      return dispatch(Actions.fetchLibraryAssetsByType(libraryId, assetType));
    }
    return dispatch(Actions.fetchStoreLibraryAssetsByType(libraryId, assetType));
  }

  handleScroll = () => {
    forceCheck();
  }

  handleClick = (event) => {
    const isClickOutside = event.target.contains(this.container);
    if (isClickOutside) {
      this.props.dispatch(Actions.close());
    }
  }

  handleTabBarIndexChange = (selectedTabBarIndex) => {
    const assetType = ASSET_TYPES.LIST[selectedTabBarIndex];
    const { loaded, loading } = this.props.assets[assetType];
    if (!loaded && !loading) {
      this.fetchAssets(this.props, assetType);
    }

    this.setState({ selectedTabBarIndex });
  }

  handleRequestAddAsset = (type) => {
    const { dispatch } = this.props;
    switch (type) {
      case ASSET_TYPES.CHARACTER:
        dispatch(InteractiveTutorial.Action.achieve(['fb4a175']));
        dispatch(CharacterModalActions.openCharacterModal());
        break;
      case ASSET_TYPES.BACKGROUND:
        dispatch(BackgroundModalActions.toggle({ open: true }));
        break;
      case ASSET_TYPES.ITEM:
        dispatch(ItemModalActions.toggle({ open: true }));
        break;
      default:
        break;
    }
  }

  handleClickAsset = (asset, type) => {
    const { dispatch } = this.props;
    switch (type) {
      case ASSET_TYPES.CHARACTER:
        dispatch(CharacterModalActions.openCharacterModal(asset));
        break;
      case ASSET_TYPES.BACKGROUND:
        dispatch(BackgroundModalActions.toggle({ open: true, asset }));
        break;
      case ASSET_TYPES.ITEM:
        dispatch(ItemModalActions.toggle({ open: true, asset }));
        break;
      case ASSET_TYPES.MUSIC:
      case ASSET_TYPES.SOUND:
        dispatch(EditAudioAssetModalActions.toggle({ open: true, asset, type }));
        break;
      default:
        break;
    }
  }

  handleAudioInputChange = (type, files) => {
    this.props.dispatch(UploadAudioAssetModalActions.toggle({
      audioFiles: files,
      open: true,
      type,
    }));
  }

  handleRequestClose = () => {
    this.props.dispatch(Actions.close());
  }

  handleOnTogglePurchasedLibrary = (toggledLibraryId, toggled) => {
    const { dispatch } = this.props;
    if (toggled) {
      dispatch(
        PurchasedLibraryActions
        .addSelectedLibraryToUser(toggledLibraryId)
      );
    } else {
      dispatch(
        PurchasedLibraryActions
        .removeSelectedLibraryFromUser(toggledLibraryId)
      );
    }
  }

  handleToggleCreateLibraryModal = () => {
    this.props.dispatch(CreateLibraryModalActions.toggleCreateLibraryModal());
  }

  handleClickSubNavBarText = () => {
    this.props.dispatch(push(this.props.route.isStore ? '/store' : '/asset'));
  }

  handlePurchaseLibrary = (library, token) => {
    const { t, dispatch, user } = this.props;
    if (user) {
      if (user.hasPaymentInfo) {
        // Confirm user for the purchase
        dispatch(AlertDialog.toggle({
          type: 'confirm',
          title: t('label.purchasingLibrary'),
          body: _unescape(t('label.confirmToPurchaseLibrary', {
            name: library.name,
            price: library.price,
            currency: 'US',
          })),
          confirmButtonTitle: t('button.purchase'),
          confirmCallback: () => {
            dispatch(Actions.purchaseLibrary(library.id));
          },
        }));
      } else {
        // First time purchase
        dispatch(Actions.purchaseLibrary(library.id, token));
      }
    } else {
      this.setState({ loginModalOpen: true });
    }
  }

  handleOnClickOwnedLibrary = () => {
    const { t, dispatch } = this.props;
    dispatch(AlertDialog.toggle({
      open: true,
      body: t('label.ownedLibraryWarning'),
      type: 'alert',
    }));
  }

  handleCloseLoginModal = () => {
    this.setState({ loginModalOpen: false });
  }

  render() {
    const {
      assets,
      loaded,
      library,
      modal,
      route,
      t,
      togglingLibraryId,
      user,
      purchasing,
    } = this.props;
    const { selectedTabBarIndex, mode, loginModalOpen } = this.state;

    const className = classNames('library-details', {
      'library-details-modal': modal,
    });

    const tabBarItems = ASSET_TYPES.LIST.map((assetType) => {
      const numOfAssets = assets[assetType].items.length;
      return {
        text: (
          <span>
            <span className="asset-type">{t(`asset:type.${assetType}`)}</span>
            {numOfAssets > 0 &&
              <span className="asset-count-badge">{numOfAssets}</span>
            }
          </span>
        ),
      };
    });

    const selectedAssetType = ASSET_TYPES.LIST[selectedTabBarIndex];
    const assetGroup = assets[selectedAssetType];

    const isAudioAsset = (
      selectedAssetType === ASSET_TYPES.MUSIC ||
      selectedAssetType === ASSET_TYPES.SOUND
    );

    const isEdit = getIsEditFromProps(this.props);

    const childrenProps = {
      libraryId: library && library.id,
      readonly: !isEdit,
    };

    const libraryType = this.getLibraryType();

    return (
      <div className={className} onClick={this.handleClick}>
        {loaded || modal ? (
          <div ref={ref => this.container = ref} className="library-details-container">
            {!modal &&
              <SubNavBar
                icon={isEdit ? <SettingIcon /> : null}
                secondaryText={_get(library, 'name')}
                text={
                  mode === 'owned' ?
                  t('MyLibraryDashboard:title') :
                  t('AssetStore:title')
                }
                fluid
                onClickIconButton={this.handleToggleCreateLibraryModal}
                onClickText={this.handleClickSubNavBarText}
              />
            }
            {!isEdit ?
              <LibraryInfo
                isStore={route.isStore}
                library={library}
                mode={mode}
                purchasing={purchasing}
                t={t}
                togglingLibraryId={togglingLibraryId}
                user={user}
                onClickOwnedLibrary={this.handleOnClickOwnedLibrary}
                onPurchase={this.handlePurchaseLibrary}
                onToggle={this.handleOnTogglePurchasedLibrary}
              /> :
              <CreateLibraryModal
                library={library}
                libraryType={libraryType}
                edit
                onClickCloseButton={this.handleToggleCreateLibraryModal}
                onClickOutside={this.handleToggleCreateLibraryModal}
              />
            }
            <div className="library-details-assets">
              <TabBar
                ref={ref => this.tabBar = ref}
                items={tabBarItems}
                selectedIndex={selectedTabBarIndex}
                onChange={this.handleTabBarIndexChange}
              />
              {isEdit && isAudioAsset &&
                <div className="audio-upload-container">
                  <AudioUpload
                    label={t(`button.add.${selectedAssetType}`)}
                    onChange={files => this.handleAudioInputChange(selectedAssetType, files)}
                  />
                </div>
              }
              <AssetGridList
                assets={assetGroup.items}
                loaded={assetGroup.loaded}
                loading={assetGroup.loading}
                placeholder={t('placeholder.empty')}
                readonly={!isEdit}
                type={selectedAssetType}
                onClickAddButton={isEdit && !isAudioAsset ? this.handleRequestAddAsset : null}
                onClickItem={this.handleClickAsset}
              />
            </div>
            {modal &&
              <FlatButton
                className="close-button"
                icon={<CloseIcon />}
                onClick={this.handleRequestClose}
              />
            }
            <CharacterModal {...childrenProps} />
            <BackgroundModal {...childrenProps} />
            <ItemModal {...childrenProps} />
            <EditAudioAssetModal {...childrenProps} />
            <UploadAudioAssetModal {...childrenProps} />
            <LoginModal
              open={loginModalOpen}
              onClickCloseButton={this.handleCloseLoginModal}
            />
          </div>
        ) : (
          <div className="library-details-loading">
            <Progress.LoadingIndicator />
          </div>
        )}
      </div>
    );
  }
}
