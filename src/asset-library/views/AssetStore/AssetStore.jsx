import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { translate } from 'react-i18next';

import _debounce from 'lodash/debounce';
import _get from 'lodash/get';

import Pagination from 'ui-elements/Pagination';
import Progress from 'ui-elements/Progress';
import SubNavBar from 'ui-elements/SubNavBar';

import AssetLibraryTabBar from 'asset-library/views/AssetLibraryTabBar';
import LibraryGridList from 'asset-library/views/LibraryGridList';

import i18n, { mapUILanguageCode } from 'common/utils/i18n';

import {
  STORE_TYPE,
  STORE_LIBRARY_LIST_TYPE,
} from 'asset-library/constants';

import AssetStoreSideBar from './AssetStoreSideBar';

import * as Actions from './AssetStore.actions';
import * as LibraryDetailsCommonActions from '../LibraryDetails/LibraryDetails.common.actions';

import './AssetStore.style.scss';


const MAXIMUM_ROWS_SHOWN = 6;

@translate('AssetStore')
@connect((store) => {
  const state = store.AssetStore;
  const enterAction = _get(store, 'routing.locationBeforeTransitions.action', '');
  const isFirstEnter = /^(REPLACE|POP)$/i.test(enterAction);
  return {
    ...state,
    isFirstEnter,
    loggedIn: store.user !== null,
    isAuthenticated: _get(store, 'user.isAuthenticated'),
    uiLanguage: _get(store, 'user.uiLanguage'),
  };
})
export default class AssetStore extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    isFirstEnter: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    featuredLibraryList: PropTypes.array.isRequired,
    libraries: PropTypes.array.isRequired,
    pageNumber: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    uiLanguage: PropTypes.string,
    children: PropTypes.node,
  }

  static defaultProps = {
    children: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      columns: 4,
    };
  }

  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.fetchFeaturedLibraryList();
    }

    this.resizeDebounce = _debounce(this.handleResize, 50);
    window.addEventListener('resize', this.resizeDebounce, false);
    this.handleResize();

    if (/^\/store$/.test(window.location.pathname)) {
      this.props.dispatch(replace('/store/collection/featured'));
      return;
    }

    // fetch libraries
    this.fetchLibraries({
      type: this.getStoreCollectionType(),
      alias: this.getFeaturedLibraryAlias(),
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      params, featuredLibraryList, isAuthenticated, uiLanguage,
    } = nextProps;

    if (!this.props.isAuthenticated && isAuthenticated) {
      this.fetchFeaturedLibraryList();
    }

    // redirect when no alias and just fetched featured library list
    if (
      featuredLibraryList.length !== this.props.featuredLibraryList.length &&
      params.collectionId === STORE_LIBRARY_LIST_TYPE.FEATURED &&
      !params.alias
    ) {
      this.props.dispatch(replace(`/store/collection/featured/${featuredLibraryList[0].alias}`));
    }

    // Prevent fetching when open/close library details
    if (!(nextProps.children || this.props.children)) {
      if (params.collectionId !== this.props.params.collectionId) {
        this.fetchLibraries({ type: params.collectionId });
      }
      if (params.alias !== this.props.params.alias) {
        this.fetchFeaturedLibraries(params.alias);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeDebounce, false);
  }

  getStoreCollectionType = () => this.props.params.collectionId;

  getFeaturedLibraryAlias = ({ params } = this.props) => params.alias;

  fetchLibraries = ({
    type,
    pageNumber = 1,
    alias = undefined,
    language = undefined,
  }) => {
    const { dispatch, libraries, featuredLibraryList } = this.props;
    const limit = this.state.columns * MAXIMUM_ROWS_SHOWN;
    const offset = (pageNumber - 1) * limit;
    if (type) {
      if (type === STORE_LIBRARY_LIST_TYPE.FEATURED) {
        if (!((featuredLibraryList.length === 0 && language) || alias)) return;
      }
      dispatch(Actions.fetchStoreLibrariesByCollection({
        type,
        offset,
        limit,
        alias,
        language,
      }));
    } else {
      dispatch(Actions.fetchStoreLibraries(offset, limit));
    }
  }

  fetchFeaturedLibraryList() {
    const language = this.props.uiLanguage || mapUILanguageCode(i18n.language);
    this.fetchLibraries({
      type: STORE_LIBRARY_LIST_TYPE.FEATURED,
      language,
    });
  }

  fetchFeaturedLibraries(alias) {
    this.fetchLibraries({
      type: STORE_LIBRARY_LIST_TYPE.FEATURED,
      alias,
    });
  }

  handleResize = () => {
    const screenWidth = window.innerWidth;

    let columns;
    if (screenWidth > 1044) {
      columns = 4;
    } else if (screenWidth > 852) {
      columns = 3;
    } else if (screenWidth > 688) {
      columns = 2;
    } else {
      columns = 1;
    }
    if (this.state.columns !== columns) {
      this.setState({ columns });
    }
  }

  handlePageChange = (pageNumber) => {
    this.fetchLibraries({
      type: this.getStoreCollectionType(),
      pageNumber,
    });
  }

  handleClickLibrary = (library) => {
    this.props.dispatch(LibraryDetailsCommonActions.setLibraryDetailsLibrary({ library, isStore: true }));
  }

  renderLibrary = () => {
    const { libraries, loading, t } = this.props;
    const { columns } = this.state;

    return (
      loading ? (
        <div><Progress.LoadingIndicator /></div>
      ) : (
        <LibraryGridList
          columns={columns}
          libraries={libraries}
          type={STORE_TYPE.ASSETSTORE}
          onClick={this.handleClickLibrary}
        />
      )
    );
  }

  render() {
    const {
      t, children, loggedIn, loading, pageNumber, totalPages,
    } = this.props;

    if (this.props.isFirstEnter && children) {
      const injectedChildren = React.Children.map(children, child =>
        React.cloneElement(child, { modal: false })
      );
      return injectedChildren[0];
    }

    const type = this.getStoreCollectionType();

    return (
      <div id="asset-store">
        <SubNavBar text={t('title')} fluid />
        <AssetLibraryTabBar loggedIn={loggedIn} />
        <div id="asset-store-container">
          <div className="library-dashboard-container">
            <div className="content">
              {this.renderLibrary()}
            </div>
            {(
              !loading &&
              totalPages > 1
            ) &&
              <Pagination
                currentPage={pageNumber}
                totalPage={totalPages}
                onPageChange={this.handlePageChange}
              />
            }
          </div>
          <AssetStoreSideBar />
        </div>
        {children}
      </div>
    );
  }
}
