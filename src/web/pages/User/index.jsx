import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'react-router-redux';
import classNames from 'classnames';

import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import Avatar from 'ui-elements/Avatar';
import Container from 'ui-elements/Container';
import Progress from 'ui-elements/Progress';
import TabBar from 'ui-elements/TabBar';

import { setInnerHTMLWithParsing } from 'common/utils';
import { getAuthItem } from 'common/utils/auth';
import { getLinkIcon } from 'web/pages/Profile/PersonalInformationTab/ExternalLink';
import {
  LINK_ALIAS,
  PROFILE_ACTION,
} from 'web/pages/Profile/Profile.constants';
import { LIKECOIN_URL } from 'common/constants';

import StoryDetails from 'editor/components/Dashboard/StoryDetails';
import Gallery from './Gallery';

import * as Actions from './actions';

import './styles.scss';


function getScreenWidth() {
  return window.innerWidth;
}

function getColumnWidth(totalWidth, interWidth, columns) {
  let columnWidth = 220;
  while (((columns * (columnWidth + interWidth)) - interWidth) > totalWidth) {
    columnWidth--;
  }
  return columnWidth;
}

function getDefaultTabIndexFromProps(props) {
  const { stories, libraries } = props;
  if (libraries.length > stories.length) {
    return 2;
  }
  return 1;
}

function handleLink(link) {
  if (link && !link.includes('http')) {
    return `https://${link}`;
  }
  return link;
}

@connect(store => ({
  self: store.user,
  ...store.UserPage,
}))
@translate(['UserPage'])
export default class UserPage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    credits: PropTypes.array,
    libraries: PropTypes.array,
    links: PropTypes.array,
    loaded: PropTypes.bool,
    loading: PropTypes.bool,
    oices: PropTypes.array,
    params: PropTypes.object,
    self: PropTypes.object,
    stats: PropTypes.object,
    stories: PropTypes.array,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedTabBarIndex: 1,
      columnWidth: 220,
      isMobile: false,
    };
  }

  componentDidMount() {
    const { id, username } = this.props.params;
    if (id || username) {
      this.props.dispatch(Actions.fetchUserProfile(id || username));
    }

    this.resizeDebounce = _debounce(this.handleResize, 50);
    this.scrollThrottle = _throttle(this.handleScroll, 20);
    window.addEventListener('resize', this.resizeDebounce, false);
    window.addEventListener('scroll', this.scrollThrottle, false);
    this.handleResize();
  }

  componentWillReceiveProps(nextProps) {
    const { id, username } = nextProps.params;

    if (
      (this.props.params.id !== id) ||
      (this.props.params.username !== username)
    ) {
      this.props.dispatch(Actions.fetchUserProfile(id || username));
    }

    // Pre-select tab that has most content
    if (nextProps.loaded && !this.props.loaded) {
      const { stories, libraries } = nextProps;
      const selectedTabBarIndex = getDefaultTabIndexFromProps(nextProps);
      if (selectedTabBarIndex !== this.state.selectedTabBarIndex) {
        this.setState({ selectedTabBarIndex });
      }
    }
  }

  componentDidUpdate() {
    this.handleScroll();
  }

  componentWillUnmount() {
    if (this.resizeDebounce) this.resizeDebounce.cancel();
    if (this.scrollThrottle) this.scrollThrottle.cancel();
    window.removeEventListener('resize', this.resizeDebounce, false);
    window.removeEventListener('scroll', this.scrollThrottle, false);
  }

  getLink = (type, item) => {
    switch (type) {
      case 'story':
        return `/story/${item.oiceUuid}`;
      case 'library':
        return `/store/library/${item.id}`;
      default:
        return null;
    }
  }

  handleResize = () => {
    const screenWidth = getScreenWidth();
    const newState = {};
    const isMobile = screenWidth <= 658;

    if (isMobile !== this.state.isMobile) {
      newState.isMobile = isMobile;
      if (!isMobile && this.state.selectedTabBarIndex === 0) {
        newState.selectedTabBarIndex = getDefaultTabIndexFromProps(this.props);
      }
    }

    if (this.contentContainer) {
      /* XXX: Hardcode from CSS value */
      const padding = isMobile ? 10 : 24;
      const interWidth = isMobile ? 12 : 20;

      let space = _get(this.contentContainer, 'parentNode.clientWidth', 0);
      space -= padding * 2; /* Padding */
      if (screenWidth > 1024) {
        space -= 272 + 16;
      }

      let columns = 4;
      if (screenWidth <= 658) {
        columns = 2;
      } else if (screenWidth <= 868) {
        columns = 3;
      } else if (screenWidth <= 1024) {
        columns = 4;
      } else if (screenWidth <= 1156) {
        columns = 3;
      }

      const prevColumns = this.state.columns;
      const prevColumnWidth = this.state.columnWidth;
      const columnWidth = getColumnWidth(space, interWidth, columns);
      if (columns !== prevColumns) {
        newState.columns = columns;
      }
      if (columnWidth !== prevColumnWidth) {
        newState.columnWidth = columnWidth;
      }
    }

    if (!_isEmpty(newState)) {
      this.setState(newState);
    }

    this.syncHeaderWidth();
  }

  handleScroll = () => {
    if (this.tabBar) {
      const tabBar = this.tabBar.getRootElement();
      const tabBarNav = this.tabBar.getNavElement();
      if (
        tabBar &&
        tabBarNav &&
        this.mobileHeader
      ) {
        const screenWidth = getScreenWidth();
        const { scrollTop } = document.querySelector('body');
        const navBarHeight = (
          document
            .querySelector('#web-navbar')
            .getBoundingClientRect()
            .height
        );
        const containerPaddingTop = parseInt(
          window
            .getComputedStyle(this.contentContainer.parentNode)
            .paddingTop,
          10
        );
        const mobileHeaderHeight = (
          this
            .mobileHeader
            .getBoundingClientRect()
            .height
        );
        const tabBarNavHeight = tabBarNav.getBoundingClientRect().height;

        let marginalScrollTop = tabBar.offsetTop + containerPaddingTop;
        let tabBarNavTop = navBarHeight;
        let tabBarPaddingTop = tabBarNavHeight;

        if (screenWidth <= 1024) {
          marginalScrollTop -= mobileHeaderHeight;
          tabBarNavTop += mobileHeaderHeight;
        }

        if (screenWidth <= 658) {
          tabBarPaddingTop += mobileHeaderHeight;
        }

        if (scrollTop >= marginalScrollTop) {
          this.mobileHeader.style.visibility = 'visible';
          this.profileInfo.style.visibility = (
            screenWidth <= 1024 ? 'hidden' : 'visible'
          );
          tabBar.style.paddingTop = `${tabBarPaddingTop}px`;
          tabBarNav.style.position = 'fixed';
          tabBarNav.style.top = `${tabBarNavTop}px`;
        } else {
          this.mobileHeader.style.visibility = 'hidden';
          this.profileInfo.style.visibility = 'visible';
          tabBar.style.paddingTop = 0;
          tabBarNav.style.position = 'relative';
          tabBarNav.style.top = 'initial';
        }
      }
    }
    this.syncHeaderWidth();
  }

  handleTabBarIndexChange = (index) => {
    this.setState({ selectedTabBarIndex: index });
  }

  handleSelect = (type, item) => {
    const { dispatch, user } = this.props;
    if (type === 'story') {
      dispatch(Actions.fetchOicesFromStory(user.id, item.id));
    }
    this.setState({ selectedItem: item });
  }

  handleSelectionCheck = (type, item) => {
    const selectedItemId = _get(this, 'state.selectedItem.id');
    switch (type) {
      case 'story':
        return item.id === selectedItemId;
      default:
        return false;
    }
  };

  handleStoryDetailsCloseRequest = () => {
    this.setState({ selectedItem: undefined });
  }

  handleClickAvatar = () => {
    window.location.href = `/profile?action=${PROFILE_ACTION.PERSONAL_INFORMATION}`;
  }

  syncHeaderWidth() {
    if (this.tabBar) {
      const tabBar = this.tabBar.getRootElement();
      const tabBarNav = this.tabBar.getNavElement();
      const tabBarRect = tabBar.getBoundingClientRect();
      const maxWidth = `${tabBarRect.width}px`;
      if (this.mobileHeader) {
        this.mobileHeader.style.maxWidth = maxWidth;
      }
      if (this.profileInfo) {
        this.profileInfo.style.maxWidth = maxWidth;
      }
      if (tabBarNav) {
        tabBarNav.style.maxWidth = `${tabBarRect.width - 2}px`; // 2 for border
      }
    }
  }

  renderAvatar(size) {
    const { user, self } = this.props;
    const isSelfProfile = _get(user, 'id') && _get(user, 'id') === _get(self, 'id');
    return (user &&
      <div id="user-avatar">
        <Avatar
          label={user.displayName}
          overlay={isSelfProfile}
          size={size}
          src={user.avatar}
          mini
          onClick={isSelfProfile ? this.handleClickAvatar : null}
        />
        <h1 id="user-displayname">
          {user.displayName}
        </h1>
      </div>
    );
  }

  renderDescription() {
    const { t } = this.props;
    const description = _get(this, 'props.user.description', '');
    return (
      <div
        id="user-description"
        {...setInnerHTMLWithParsing(
          description || t('placeholder.noDescription')
        )}
      />
    );
  }

  renderExternalLinkItem = ({ link, typeAlias, label }) => (
    <a
      className="user-link"
      href={handleLink(link)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="link-icon">{getLinkIcon(typeAlias)}</div>
      <div className="link-icon grey">{getLinkIcon(typeAlias, true)}</div>
      <span>{label}</span>
    </a>
  );

  renderExternalLinks() {
    const { t, links, user } = this.props;
    const likeCoinId = _get(user, 'likeCoinId');
    return (
      <div id="user-external-links">
        {!!likeCoinId && this.renderExternalLinkItem({
          link: `${LIKECOIN_URL}/${likeCoinId}`,
          typeAlias: LINK_ALIAS.LIKECOIN,
          label: t('label.supportByLikeCoin'),
        })}
        {links.map(this.renderExternalLinkItem)}
      </div>
    );
  }

  renderStats() {
    const { stats, t } = this.props;
    return (
      <div id="user-stats">
        {stats && [{
          label: t('label.stats.oices'),
          count: stats.oices,
        }, {
          label: t('label.stats.assets'),
          count: stats.assets,
        }].map(({ label, count }, index) => (
          <div key={index} className="user-stats-item">
            <span>{label}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    );
  }

  renderProfile() {
    return (
      <div>
        <div
          ref={ref => this.profileInfo = ref}
          className="panel"
          id="user-profile-info"
        >
          {this.renderAvatar(142)}
          <div className="user-details">
            {this.renderDescription()}
            {this.renderExternalLinks()}
          </div>
          {this.renderStats()}

        </div>
        {this.renderLikeWidget('hidden-md-and-down')}
      </div>
    );
  }

  renderMobileHeader() {
    return (
      <div
        ref={ref => this.mobileHeader = ref}
        className="panel"
        id="user-profile-mobile-header"
      >
        {this.renderAvatar(42)}
      </div>
    );
  }

  renderProfileTab() {
    return (
      <div id="user-profile-info-tab">
        {this.renderStats()}
        {this.renderDescription()}
        {this.renderExternalLinks()}
      </div>
    );
  }

  renderPortfolio() {
    const {
      credits,
      libraries,
      oices,
      loading,
      self,
      stories,
      t,
      user,
    } = this.props;
    const {
      columns,
      columnWidth,
      isMobile,
      selectedItem,
      selectedTabBarIndex,
    } = this.state;

    const tabBarItems = [
      { text: t('tabBar.user') },
      { text: t('tabBar.stories') },
      { text: t('tabBar.libraries') },
      // { text: t('tabBar.credits') },
    ];

    const galleryProps = {
      columns,
      columnWidth,
      onSelectionCheck: this.handleSelectionCheck,
    };

    const isSelf = _get(user, 'id') === _get(self, 'id');

    function getTabPlaceholder(key) {
      if (loading) {
        return <Progress.LoadingIndicator />;
      }
      return t(`placeholder.no${isSelf ? 'Your' : ''}${key}`, {
        user: _get(user, 'displayName', ''),
      });
    }

    const storyExpandedChild = (
      <StoryDetails
        isDashboard={false}
        oices={oices}
        story={selectedItem}
        onRequestClose={this.handleStoryDetailsCloseRequest}
      />
    );

    // XXX hardcoded height
    let galleryExpansionPanelHeight = 400;
    if (oices.length > 0) {
      const height = 48 + (40 * (oices.length + 2));
      if (height > galleryExpansionPanelHeight) {
        galleryExpansionPanelHeight = height;
      }
    }

    return (
      <TabBar
        ref={ref => this.tabBar = ref}
        className="panel"
        id="user-portfolio"
        items={tabBarItems}
        selectedIndex={selectedTabBarIndex}
        onChange={this.handleTabBarIndexChange}
      >
        {this.renderProfileTab()}
        <Gallery
          {...galleryProps}
          emptyChild={getTabPlaceholder('Story')}
          expandedChild={storyExpandedChild}
          galleryExpansionPanelHeight={galleryExpansionPanelHeight}
          items={stories}
          type="story"
          onSelect={this.handleSelect}
        />
        <Gallery
          {...galleryProps}
          emptyChild={getTabPlaceholder('Library')}
          items={libraries}
          getLink={this.getLink}
          type="library"
        />
        {/* <Gallery
          {...galleryProps}
          emptyChild={getTabPlaceholder('Credits')}
          items={credits}
          type="story"
        /> */}
      </TabBar>
    );
  }

  renderLikeWidget(className) {
    const { user } = this.props;
    if (!user || !user.likeCoinId) return null;

    const iframeClassName = classNames('user-page__like-widget', className);
    return (
      <iframe
        allowTransparency
        className={iframeClassName}
        frameBorder="0"
        scrolling="no"
        src={`${LIKECOIN_URL}/in/embed/${user.likeCoinId}/?referrer=${window.location.href}`}
        title="like-widget"
      />
    );
  }

  render() {
    return (
      <Container id="user-profile-wrapper" fluid>
        <div
          ref={ref => this.contentContainer = ref}
          id="user-profile"
        >
          {this.renderMobileHeader()}
          {this.renderProfile()}
          {this.renderPortfolio()}
          <div className="user-page__like-widget-wrapper hidden-md-and-up">
            {this.renderLikeWidget()}
          </div>
        </div>
      </Container>
    );
  }
}
