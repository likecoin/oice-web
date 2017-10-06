import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';

import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import GreyButton from 'ui-elements/GreyButton';
import Progress from 'ui-elements/Progress';
import SubNavBar from 'ui-elements/SubNavBar';
import AddIcon from 'common/icons/add-thin';

import AssetLibraryTabBar from 'asset-library/views/AssetLibraryTabBar';
import LibraryGridList from 'asset-library/views/LibraryGridList';

import { LIBRARY_TYPE, STORE_TYPE, TAB_BAR_ITEM } from 'asset-library/constants';

import { UserLoggedIn } from 'asset-library/utils/auth';

import { USER_ROLE_NORMAL } from 'common/constants/userRoles';
import { isNormalUser } from 'common/utils/user';

import './MyLibraryDashboard.style.scss';

const LIBRARY_TYPES = [
  LIBRARY_TYPE.PUBLIC,
  LIBRARY_TYPE.PRIVATE,
  LIBRARY_TYPE.FORSALE,
];

@UserLoggedIn
@translate('MyLibraryDashboard')
@connect((store) => {
  const state = store.LibraryDashboard;
  return {
    public: state.public,
    private: state.private,
    forSale: state.forSale,
    user: store.user,
  };
})
export default class MyLibraryDashboard extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    forSale: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    private: PropTypes.object.isRequired,
    public: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    onClickAddLibraryButton: PropTypes.func.isRequired,
    children: PropTypes.node,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      columns: 4,
    };
  }

  componentDidMount() {
    this.resizeDebounce = _debounce(this.handleResize, 50);
    this.scrollThrottle = _throttle(this.handleScroll, 20);
    window.addEventListener('resize', this.resizeDebounce, false);
    window.addEventListener('scroll', this.scrollThrottle, false);
    this.handleResize();
  }

  getLibrarySection(type) {
    return this.props[type];
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

  handleScroll = () => {

  }

  handleClickLibrary = (library) => {
    const { dispatch, user } = this.props;
    if (library.price >= 0 || !isNormalUser(user.role)) {
      dispatch(push(`/asset/library/${library.id}/edit`));
    } else {
      dispatch(push(`/asset/library/${library.id}`));
    }
  }

  renderSection = (type) => {
    const { t } = this.props;
    const { columns } = this.state;
    const { libraries } = this.getLibrarySection(type);
    return (
      libraries.length > 0 &&
      <li key={type} className="library-section">
        <h1><span>{t(`label.${type}`)}</span></h1>
        <LibraryGridList
          columns={columns}
          libraries={libraries}
          type={STORE_TYPE.MYLIBRARIES}
          onClick={this.handleClickLibrary}
        />
      </li>
    );
  }

  renderSideBar() {
    const { t, onClickAddLibraryButton } = this.props;
    const { columns } = this.state;
    const style = {
      width: `calc((100% - 144px) * ${1.0 / columns})`,
    };
    return (
      <div className="left-sidebar" style={style}>
        <GreyButton
          className="library-grid-item"
          icon={<AddIcon />}
          onClick={onClickAddLibraryButton}
        />
        <span>{t('button.createLibrary')}</span>
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const loading = LIBRARY_TYPES.some(type => this.props[type].loading);

    return (
      <div id="my-library-dashboard">
        <SubNavBar text={t('title')} fluid />
        <AssetLibraryTabBar />
        <div className="library-dashboard-container">
          {this.renderSideBar()}
          {loading ? (
            <div className="loading">
              <Progress.LoadingIndicator />
            </div>
          ) : (<div className="content">
            <ul className="library-section-list">
              {LIBRARY_TYPES.map(this.renderSection)}
            </ul>
          </div>
          )}
        </div>
        {this.props.children}
      </div>
    );
  }
}
