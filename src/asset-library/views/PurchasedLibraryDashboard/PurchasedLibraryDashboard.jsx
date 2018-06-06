import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';

import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import Progress from 'ui-elements/Progress';
import SubNavBar from 'ui-elements/SubNavBar';
import StoreLargeIcon from 'common/icons/store-large-icon';

import AssetLibraryTabBar from 'asset-library/views/AssetLibraryTabBar';
import LibraryGridList from 'asset-library/views/LibraryGridList';

import { STORE_TYPE } from 'asset-library/constants';

import {
  addSelectedLibraryToUser,
  removeSelectedLibraryFromUser,
} from './PurchasedLibraryDashboard.actions';
import { setLibraryDetailsLibrary as openLibrary } from '../LibraryDetails/LibraryDetails.common.actions';

import './PurchasedLibraryDashboard.style.scss';


@translate('PurchasedLibraryDashboard')
@connect((store) => {
  const state = store.LibraryDashboard;
  return {
    loading: state.isFetchingPurchasedLibraries && !state.isFetchedPurchasedLibraries,
    selected: state.selected,
    unselected: state.unselected,
    ...store.PurchasedLibraryDashboard,
  };
}, {
  addSelectedLibraryToUser,
  removeSelectedLibraryFromUser,
  openLibrary,
})
export default class PurchasedLibraryDashboard extends React.Component {
  static propTypes = {
    addSelectedLibraryToUser: PropTypes.func.isRequired,
    removeSelectedLibraryFromUser: PropTypes.func.isRequired,
    openLibrary: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    selected: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    unselected: PropTypes.object.isRequired,
    onClickAssetStore: PropTypes.func.isRequired,
    children: PropTypes.node,
    togglingLibraryId: PropTypes.number,
  }

  constructor(props) {
    super(props);

    this.state = {
      columns: 4,
    };
  }

  componentDidMount() {
    this.resizeDebounce = _debounce(this.handleResize, 50);
    window.addEventListener('resize', this.resizeDebounce, false);
    this.handleResize();
  }

  handleResize = () => {
    const screenWidth = window.innerWidth;

    let columns = 4;
    if (screenWidth >= 864) {
      columns = 4;
    } else if (screenWidth >= 696) {
      columns = 3;
    } else if (screenWidth >= 528) {
      columns = 2;
    } else {
      columns = 1;
    }
    if (this.state.columns !== columns) {
      this.setState({ columns });
    }
  }

  handleLibraryClick = library => this.props.openLibrary({ library })

  handleToggleLibrary = (libraryId, toggled) => {
    if (toggled) {
      this.props.addSelectedLibraryToUser(libraryId);
    } else {
      this.props.removeSelectedLibraryFromUser(libraryId);
    }
  }

  renderLibrary = () => {
    const {
      selected, t, togglingLibraryId, unselected,
    } = this.props;
    const { columns } = this.state;
    return (
      <LibraryGridList
        columns={columns}
        libraries={[...selected.libraries, ...unselected.libraries]}
        togglingLibraryId={togglingLibraryId}
        type={STORE_TYPE.PURCHASEDLIBRARIES}
        onClick={this.handleLibraryClick}
        onToggleLibrary={this.handleToggleLibrary}
      />
    );
  }

  renderSideBar() {
    const { t } = this.props;
    const { columns } = this.state;
    const style = {
      width: `calc((100% - 144px) * ${1.0 / columns})`,
    };
    return (
      <div className="left-sidebar" style={style}>
        <div className="go-asset-store" onClick={this.props.onClickAssetStore}>
          <StoreLargeIcon />
          <span>{t('button.goToAssetStore')}</span>
        </div>
      </div>
    );
  }

  render() {
    const { t, togglingLibraryId, loading } = this.props;

    return (
      <div id="purchase-library-dashboard">
        <SubNavBar text={t('title')} fluid />
        <AssetLibraryTabBar />
        <div className="library-dashboard-container">
          {this.renderSideBar()}
          {loading && !togglingLibraryId ? (
            <div className="loading">
              <Progress.LoadingIndicator />
            </div>
          ) : (
            <div className="content">
              <ul className="library-section-list">
                {this.renderLibrary()}
              </ul>
            </div>
          )}
        </div>
        {this.props.children}
      </div>
    );
  }
}
