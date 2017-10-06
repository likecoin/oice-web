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
import Card from 'ui-elements/Card';
import Container from 'ui-elements/Container';
import LoadingScreen from 'ui-elements/LoadingScreen';
import TabBar from 'ui-elements/TabBar';

import { setInnerHTMLWithParsing } from 'common/utils';
import { getAuthItem } from 'common/utils/auth';
import { getLinkIcon } from 'web/pages/Profile/PersonalInformationTab/ExternalLink';

import Gallery from './Gallery';
import StoryDetails from './StoryDetails';

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
  self: store.Profile.userProfile,
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
      selectedTabBarIndex: -1,
      columnWidth: 220,
      isMobile: false,
    };
  }

  componentDidMount() {
    const authItem = getAuthItem();

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
    if (!id && !username) {
      if (nextProps.self) {
        // Redirect to user's user page when not user id given in the URL
        this.props.dispatch(push(`/user/${nextProps.self.id}`));
      } else {
        // Redirect to home when not log in
        this.props.dispatch(push('/about'));
      }
    } else if (
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

  handleItemSelect = (type, item) => {
    switch (type) {
      case 'story': {
        if (this.state.isMobile) {
          window.location.href = `/story/${item.oiceUuid}`;
        }
        const { dispatch, user } = this.props;
        const { selectedItem } = this.state;
        if (_get(selectedItem, 'id') !== item.id) {
          dispatch(Actions.closeOiceList());
          dispatch(Actions.fetchOicesFromStory(user.id, item.id));
          this.setState({ selectedItem: item });
        } else {
          this.setState({ selectedItem: undefined });
        }
        break;
      }
      default:
        break;
    }
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
    const { user } = this.props;
    return (user &&
      <div id="user-avatar">
        <Avatar
          label={user.displayName}
          size={size}
          src={user.avatar}
          mini
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
    const { links } = this.props;
    return (
      <div id="user-external-links">
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
        }, {
          label: t('label.stats.credits'),
          count: stats.credits,
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
      <div
        ref={ref => this.profileInfo = ref}
        className="panel"
        id="user-profile-info"
      >
        {this.renderAvatar(142)}
        {this.renderDescription()}
        {this.renderExternalLinks()}
        {this.renderStats()}
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
      { text: t('tabBar.credits') },
    ];

    const gallaryProps = {
      columns,
      columnWidth,
      expandedChild: !isMobile && (
        <StoryDetails
          oices={oices}
          story={selectedItem}
          onRequestClose={this.handleStoryDetailsCloseRequest}
        />
      ),
      onSelect: this.handleItemSelect,
      onSelectionCheck: this.handleSelectionCheck,
    };

    const isSelf = _get(user, 'id') === _get(self, 'id');
    function getPlaceholderTranslateKey(key) {
      return t(`placeholder.no${isSelf ? 'Your' : ''}${key}`, {
        user: _get(user, 'displayName', ''),
      });
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
          {...gallaryProps}
          emptyChild={getPlaceholderTranslateKey('Story')}
          items={stories}
          type="story"
        />
        <Gallery
          {...gallaryProps}
          emptyChild={getPlaceholderTranslateKey('Library')}
          items={libraries}
          type="library"
        />
        <Gallery
          {...gallaryProps}
          emptyChild={getPlaceholderTranslateKey('Credits')}
          items={credits}
          type="story"
        />
      </TabBar>
    );
  }

  render() {
    return (
      <Container id="user-profile-wrapper" fluid>
        {this.props.loading ? (
          <LoadingScreen />
        ) : (
          <div
            ref={ref => this.contentContainer = ref}
            id="user-profile"
          >
            {this.renderMobileHeader()}
            {this.renderProfile()}
            {this.renderPortfolio()}
          </div>
        )}
      </Container>
    );
  }
}
