import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';

import _debounce from 'lodash/debounce';

import GreyButton from 'ui-elements/GreyButton';
import Progress from 'ui-elements/Progress';
import SubNavBar from 'ui-elements/SubNavBar';
import AddIcon from 'common/icons/add-thin';

import AssetLibraryTabBar from 'asset-library/views/AssetLibraryTabBar';
import LibraryGridList from 'asset-library/views/LibraryGridList';

import {
  MY_LIBRARY_TYPES,
  STORE_TYPE,
} from 'asset-library/constants';

import { UserLoggedIn } from 'asset-library/utils/auth';

import { USER_ROLE_NORMAL } from 'common/constants/userRoles';
import { isNormalUser } from 'common/utils/user';

import {
  setLibraryDetailsLibrary as openLibrary,
} from '../LibraryDetails/LibraryDetails.common.actions';

import './MyLibraryDashboard.style.scss';


@UserLoggedIn
@translate('MyLibraryDashboard')
@connect((store) => {
  const state = store.LibraryDashboard;
  return {
    loading: state.isFetchingMyLibraries && !state.isFetchedMyLibraries,
    public: state.public,
    private: state.private,
    forSale: state.forSale,
    user: store.user,
  };
}, {
  openLibrary,
})
export default class MyLibraryDashboard extends React.Component {
  static propTypes = {
    forSale: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
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
    window.addEventListener('resize', this.resizeDebounce, false);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeDebounce);
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

  handleClickLibrary = (library) => {
    this.props.openLibrary(({
      library,
      isEdit: library.price >= 0 || !isNormalUser(this.props.user.role),
    }));
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
    const { t, loading } = this.props;

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
              {MY_LIBRARY_TYPES.map(this.renderSection)}
            </ul>
          </div>
          )}
        </div>
        {this.props.children}
      </div>
    );
  }
}
