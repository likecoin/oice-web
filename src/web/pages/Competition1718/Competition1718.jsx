/* global firebase: true */

import React from 'react';
import {
  Element,
  scroller,
} from 'react-scroll';
import Sticky from 'react-stickynode';
import PropTypes from 'prop-types';

import _times from 'lodash/times';
import _get from 'lodash/get';
import classNames from 'classnames';

import i18n from 'common/utils/i18n';

import Avatar from 'ui-elements/Avatar';
import Card from 'ui-elements/Card';
import GridList from 'ui-elements/GridList';
import OutlineButton from 'ui-elements/OutlineButton';
import Separator from 'ui-elements/Separator';
import TabBar from 'ui-elements/TabBar';

import { isMobileAgent } from 'common/utils';
import { getCSSIntegerValue } from 'common/utils/DOM';

import './Competition1718.styles.scss';


export default class Competition1718 extends React.Component {
  constructor(props) {
    super(props);

    this._isMobile = isMobileAgent();

    this.state = {
      activeTabIndex: 0,

      // From Firebase
      _t: {},
      banner: '',
      header: {
        subtitle: '',
        title: '',
        moreInfoButton: {
          link: '',
          title: '',
        },
        tabBarItems: [],
      },
      body: {
        entriesHeader: '',
        entries: {},
        prizes: [],
      },
    };
  }

  componentDidMount() {
    this._fetchContent();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeTabIndex !== this.state.activeTabIndex) {
      scroller.scrollTo('page-content', {
        duration: 500,
        smooth: 'easeInOutQuad',
        offset: -1 * (
          getCSSIntegerValue(this._pageElement, 'padding-top')
          + this._pageHeaderElement.clientHeight
        ),
      });
    }
  }

  _fetchContent= async () => {
    const content = await firebase.database()
                                  .ref('competition1718')
                                  .once('value')
                                  .then(snapshot => snapshot.val());

    if (content) this.setState(content);
  }

  _handleTabChange = (activeTabIndex) => {
    this.setState({ activeTabIndex });
  }

  _renderBanner() {
    const { banner, header } = this.state;

    if (!banner) return null;

    return (
      <div className="page-banner">
        <div>
          <img src={banner} alt={header.title} />
        </div>
      </div>
    );
  }

  _renderHeader() {
    const { header } = this.state;

    if (!header) return null;

    const { moreInfoButton, subtitle, title } = header;

    return (
      <header
        ref={(r) => { this._pageHeaderElement = r; }}
        className="page-header"
      >

        <Sticky
          top="#web-navbar"
          bottomBoundary=".competition1718"
          enabled={!this._isMobile}
        >

          <div className="headline">
            <div className="title">
              <h1>{title}</h1>
              <h2>{subtitle}</h2>
            </div>

            <a className="more-info" href={moreInfoButton.link}>
              {moreInfoButton.title}
            </a>

          </div>

          {this._renderTabBar()}

        </Sticky>

      </header>
    );
  }

  _renderTabBar() {
    const { header, activeTabIndex } = this.state;

    if (!header.tabBarItems) return null;

    const filteredTabBarItems = header.tabBarItems.filter(({ enabled }) => enabled);

    return (
      <Sticky
        top="#web-navbar"
        bottomBoundary=".competition1718"
        enabled={this._isMobile}
      >

        <TabBar
          className="asset-library-dashboard-tabbar"
          items={filteredTabBarItems.map(({ title }) => ({ text: title }))}
          selectedIndex={activeTabIndex}
          onChange={this._handleTabChange}
        />

      </Sticky>
    );
  }

  _renderBody() {
    const { body, header, activeTabIndex } = this.state;
    const activeTabBarItem = _get(header, `tabBarItems[${activeTabIndex}]`);

    if (!body || !activeTabBarItem) return null;

    return (
      <Element name="page-content" className="page-content">
        {this._renderPage(activeTabBarItem.pageId)}
      </Element>
    );
  }

  _renderPage(pageId) {
    switch (pageId) {
      case 'results':
        return this._renderResults();
      case 'entries':
        return this._renderEntries();
      default:
        return null;
    }
  }

  _renderResults = () => {
    const { _t, body, header } = this.state;

    const prizes = _get(body, 'prizes', []);

    const { tabBarItems } = header;

    return (
      <div className="prizes-page">
        <section className="prize-list">
          {prizes.map((prize) => {
            const story = _get(body, `entries.[story-${prize.story}]`);
            if (!story) return null;

            return (
              <div key={prize.title} className="prize">

                <div className="prize-details">

                  <a
                    className="story-thumbnail"
                    alt={story.name}
                    href={story.link}
                  >
                    <img alt={story.name} src={story.thumbnail} />
                  </a>

                  <div>
                    <h3 className="prize-title">{prize.title}</h3>

                    <div className="story-info">
                      <h4>{story.name}</h4>
                      <p>{story.description}</p>
                    </div>
                    <div className="judges-comment">
                      <h4>{_t.judgesComment}</h4>
                      <p>{prize.comment}</p>
                    </div>
                  </div>

                </div>

                <div className="credits">
                  <span>{i18n.t('oiceSingleView:credit.director')}</span>
                  <Avatar
                    label={story.author.name}
                    src={story.author.avatar}
                    size={34}
                  />
                </div>

              </div>
            );
          })}
        </section>
        <footer>
          {!!tabBarItems &&
            <OutlineButton
              color="blue"
              width={200}
              label={_get(tabBarItems, `[${tabBarItems.length - 1}].title`)}
              onClick={() =>
                this.setState({ activeTabIndex: tabBarItems.length - 1 }
              )}
            />
          }
        </footer>
      </div>
    );
  }

  _renderEntries = () => {
    const { body } = this.state;

    if (!body.entries) return null;

    const randomizedStories = Object.values(body.entries)
                                    .sort(() => 0.5 - Math.random());

    return (
      <div className="entries-page">

        <header
          className="content"
          dangerouslySetInnerHTML={{ __html: body.entriesHeader }}
        />

        <section className="entries-grid">
          <GridList elementWidth={220} interSpace={24}>
            {randomizedStories.map(this._renderStory)}
          </GridList>
        </section>

      </div>
    );
  }

  _renderStory = story => (
    <Card key={story.id} onClick={() => window.location.href = story.link}>
      <Card.Image src={story.thumbnail} />
      <Card.Content>
        <Card.Header>
          {story.name}
        </Card.Header>
        <Card.Meta>
          <div className="credits">
            <span>{i18n.t('oiceSingleView:credit.director')}</span>
            <Avatar
              label={story.author.name}
              src={story.author.avatar}
              size={34}
            />
          </div>
        </Card.Meta>
      </Card.Content>
    </Card>
  )

  render() {
    return (
      <article
        ref={(r) => { this._pageElement = r; }}
        className="competition1718"
      >
        <Separator />
        <section className="page-container">

          {this._renderBanner()}
          {this._renderHeader()}
          {this._renderBody()}

        </section>
      </article>
    );
  }
}
