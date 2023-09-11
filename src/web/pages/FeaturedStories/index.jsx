/* global branch: true */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {
  Motion,
  TransitionMotion,
  spring,
} from 'react-motion';
import Measure from 'react-measure';

import classNames from 'classnames';
import _get from 'lodash/get';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import QRCode from 'qrcode.react';

import Container from 'ui-elements/Container';
import OiceThumbnail from 'ui-elements/OiceThumbnail';
import OutlineButton from 'ui-elements/OutlineButton';
import Progress from 'ui-elements/Progress';

import {
  getThumbnail,
  getOiceCdnUrlFromUuid,
} from 'common/utils';

import {
  BRANCH_KEY,
  BRANCH_URL,
} from 'common/constants/branch';

import DownloadAppBadges from 'web/components/DownloadAppBadges';

import * as LogActions from 'common/actions/log';
import i18n from 'common/utils/i18n';

import TestFlightInvitation from '../TestFlightInvitation';
import Header from '../Home/Header';
import SmsModal from '../OiceSingleView/SmsModal';
import * as OiceSingleViewUtils from '../OiceSingleView/utils';

import { fetchFeaturedStories } from './redux';

import ArrowIcon from './icons/arrow';

import './styles.scss';


const SPRING_SETTING_1 = {
  stiffness: 400,
  damping: 30,
};

const SPRING_SETTING_2 = {
  stiffness: 100,
  damping: 30,
};

const ACTIVE_STORY_INDEX = 3;
const MAX_SUPPORT_WIDTH = 1244;
const SLIDE_MARGIN = 16;
const SLIDE_WIDTH = 144;
const SLIDE_ACTIVE_WIDTH = 464;
const SLIDE_WIDTH_WITH_MARGIN = SLIDE_WIDTH + SLIDE_MARGIN;
const SLIDE_ACTIVE_WIDTH_WITH_MARGIN = SLIDE_ACTIVE_WIDTH + SLIDE_MARGIN;
const MIN_SLIDE_COUNT = Math.ceil(MAX_SUPPORT_WIDTH / SLIDE_WIDTH_WITH_MARGIN) + ACTIVE_STORY_INDEX * 2;
const STORY_INTRO_LEFT_OFFSET = SLIDE_WIDTH_WITH_MARGIN / 2 + SLIDE_ACTIVE_WIDTH_WITH_MARGIN - SLIDE_MARGIN / 2;

const STORY_INTRO_ROOT_STYLE = {
  marginLeft: STORY_INTRO_LEFT_OFFSET,
  width: `calc(100% - ${STORY_INTRO_LEFT_OFFSET}px)`,
};

function getExtendedStoryList(stories) {
  if (!stories || stories.length < 3) {
    return [];
  }

  // Calculate how many times that the size of story list should be multiplied
  const multiplier = Math.max(1, Math.ceil(MIN_SLIDE_COUNT / stories.length));

  // Multiply the size of the story list
  let extendedOiceList = [];
  for (let i = 0; i < multiplier; i++) {
    extendedOiceList = extendedOiceList.concat(stories);
  }

  // Insert unique key for each story
  return extendedOiceList.map((story, index) => ({
    ...story,
    key: `story-${story.id}-${index}`,
  }));
}

function getHeroImageEnteringStyle() {
  return { opacity: 0 };
}

function getHeroImageLeavingStyle() {
  return { opacity: spring(0, SPRING_SETTING_2) };
}

function getStoryIntroEnteringStyle() {
  return { opacity: 0, x: 56 };
}

function getStoryIntroLeavingStyle() {
  return { opacity: spring(0, SPRING_SETTING_2), x: spring(56, SPRING_SETTING_2) };
}

@connect(store => ({ ...store.FeaturedStories }))
@translate('FeaturedStories')
export default class FeaturedStories extends React.Component {
  static propTypes = {
    // HoC
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,

    // From redux store
    stories: PropTypes.array,
    isLoaded: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      stories: [],
      prevStory: null,
      isSliding: false,
      isOicePlayerShowed: true,
      isCallForActionShowed: false,
      isSmsModalOpened: false,
      numOfShownStories: 0,
      scrollingOffset: document.querySelector('body').scrollTop || 0,
    };

    branch.init(BRANCH_KEY);
  }

  componentDidMount() {
    this.props.dispatch(fetchFeaturedStories(i18n.language));
    window.addEventListener('message', this.handleOiceAction, false);

    this.scrollThrottle = _throttle(this.handleScroll, 44);
    window.addEventListener('scroll', this.scrollThrottle, false);
  }

  componentWillReceiveProps(nextProps) {
    const stories = getExtendedStoryList(nextProps.stories);

    // Shift the index of first story to active story index by inserting stories before it
    stories.unshift(...stories.splice(-ACTIVE_STORY_INDEX));

    this.setState({ stories });
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleOiceAction, false);
    window.removeEventListener('scroll', this.scrollThrottle, false);

    this.clearShowOicePlayerTimer();
  }

  handleScroll = () => {
    const scrollingOffset = (
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0
    );
    this.setState({ scrollingOffset });
  }

  handleRestAnimation = () => {
    this.setState({ isSliding: false }, () => {
      // Deferred loading of oice player for smoother animation
      this.showOicePlayerTimer = setTimeout(() => {
        this.setState({ isOicePlayerShowed: true });
      }, 1500);
    });
  }

  handleOiceAction = ({ data }) => {
    if (typeof data !== 'string') return;
    try {
      const action = JSON.parse(data);
      if (action.type === 'oice.end') {
        this.setState({ isCallForActionShowed: true });
      }
    } catch (error) {
      // Do nothing
    }
  }

  handleClickPreviousButton = () => this.selectStorySlide(ACTIVE_STORY_INDEX - 1)

  handleClickNextButton = () => this.selectStorySlide(ACTIVE_STORY_INDEX + 1)

  handleLogOnClickGooglePlayIcon = () => {
    this.props.dispatch(LogActions.logClickWeb('getAppButtonGooglePlay'));
  }

  handleLogOnClickAppStoreIcon = () => {
    this.props.dispatch(LogActions.logClickWeb('getAppButtonAppStore'));
  }

  _handleStorySliderTrackResize = (contentRect) => {
    const { width } = contentRect.bounds;
    const numOfShownStories = (Math.ceil((width - SLIDE_ACTIVE_WIDTH_WITH_MARGIN) / SLIDE_WIDTH_WITH_MARGIN) * 2 - 1) + (ACTIVE_STORY_INDEX * 2) - 1;
    if (this.state.numOfShownStories !== numOfShownStories) {
      this.setState({ numOfShownStories });
    }
  }

  _deferredHandleStorySliderTrackResize = _debounce(this._handleStorySliderTrackResize, 500);

  _deferredHandleRestAnimation = _debounce(this.handleRestAnimation, 500);

  selectStorySlide = (index) => {
    this.clearShowOicePlayerTimer();

    const offset = index - ACTIVE_STORY_INDEX;
    const stories = [...this.state.stories];

    const prevStory = stories[ACTIVE_STORY_INDEX];

    // Shift the stories
    if (offset >= 0) {
      stories.push(...stories.splice(0, offset));
    } else {
      stories.unshift(...stories.splice(offset));
    }

    this.setState({
      prevStory,
      stories,
      isSliding: true,
      isOicePlayerShowed: false,
      isCallForActionShowed: false,
    });
  }

  clearShowOicePlayerTimer() {
    if (this.showOicePlayerTimer) {
      clearTimeout(this.showOicePlayerTimer);
      this.showOicePlayerTimer = undefined;
    }
  }

  toggleSmsModal = () => {
    this.setState({ isSmsModalOpened: !this.state.isSmsModalOpened });
  }

  renderStorySlider() {
    const { isLoaded } = this.props;

    const styles = [
      {
        key: 'hero-image',
        style: {},
      },
      {
        key: 'slider-track',
        style: { opacity: spring(isLoaded ? 1 : 0, SPRING_SETTING_1) },
      },
    ];

    if (!isLoaded) {
      styles.push({
        key: 'loading-indicator',
        style: { opacity: spring(1, SPRING_SETTING_1) },
      });
    }

    return (
      <TransitionMotion
        willEnter={getHeroImageEnteringStyle}
        willLeave={getHeroImageLeavingStyle}
        styles={styles}
      >
        {interpolatedStyles => (
          <div className="story-slider">
            {interpolatedStyles.map(({ key, style }) => {
              switch (key) {
                case 'hero-image':
                  return this.renderActiveStoryHeroImageWrapper(key);

                case 'loading-indicator':
                  return (
                    <div key={key} className="loading-wrapper" style={style}>
                      <Progress.LoadingIndicator />
                    </div>
                  );

                case 'slider-track':
                  if (this.state.stories.length === 0) {
                    return null;
                  }

                  return (
                    <Measure bounds onResize={this._deferredHandleStorySliderTrackResize}>
                      {({ measureRef }) => (
                        <div
                          ref={measureRef}
                          key={key}
                          className="story-slider-track"
                          style={style}
                        >
                          <ul>
                            {this.state.stories
                              .slice(0, this.state.numOfShownStories)
                              .map(this.renderStorySlide)}
                          </ul>
                          {this.renderActiveStoryIntroWrapper()}
                          <div className="prev-button">
                            <span role="button" onClick={this.handleClickPreviousButton}>
                              <ArrowIcon />
                            </span>
                          </div>
                          <div className="next-button">
                            <span role="button" onClick={this.handleClickNextButton}>
                              <ArrowIcon />
                            </span>
                          </div>
                        </div>
                      )}
                    </Measure>
                  );

                default:
                  return null;
              }
            })}
          </div>
        )}
      </TransitionMotion>
    );
  }

  renderStorySlide = (story, index, stories) => {
    const isActive = index === ACTIVE_STORY_INDEX;
    const isMarginal = index === 0 || index === stories.length - 1;

    const width = isActive ? SLIDE_ACTIVE_WIDTH : SLIDE_WIDTH;
    const left = (
      (index - ACTIVE_STORY_INDEX) * SLIDE_WIDTH_WITH_MARGIN
      + (index > ACTIVE_STORY_INDEX ? SLIDE_ACTIVE_WIDTH_WITH_MARGIN : SLIDE_WIDTH_WITH_MARGIN)
      - SLIDE_WIDTH_WITH_MARGIN / 2
    );

    const defaultStyle = { width, opacity: 0, left };
    const style = {
      width: spring(width, SPRING_SETTING_1),
      opacity: isMarginal ? 0 : 1,
      left: isMarginal ? left : spring(left, SPRING_SETTING_1),
    };

    const className = classNames('story', { active: isActive });

    const coverURL = getThumbnail(story.cover) || '/static/img/oice-default-cover.jpg';

    return (
      <Motion
        key={story.key}
        defaultStyle={defaultStyle}
        style={style}
        onRest={this._deferredHandleRestAnimation}
      >
        {interpolatedStyle => (
          <li
            key={`story-${story.id}`}
            role="button"
            className={className}
            style={interpolatedStyle}
            onClick={() => !isActive && this.selectStorySlide(index)}
          >
            <div style={{ backgroundImage: `url(${coverURL})` }}>
              {isActive && this.renderOicePlayer(story)}
            </div>
          </li>
        )}
      </Motion>
    );
  }

  renderActiveStoryHeroImageWrapper(key) {
    const { prevStory, stories } = this.state;

    if (stories.length <= 0) {
      return null;
    }

    const story = stories[ACTIVE_STORY_INDEX];

    const styles = [
      {
        key: story.key,
        data: story,
        style: { opacity: spring(1, SPRING_SETTING_2) },
      },
    ];

    if (prevStory) {
      styles.unshift({
        key: prevStory.key,
        data: prevStory,
        style: { opacity: spring(0, SPRING_SETTING_2) },
      });
    }

    return (
      <TransitionMotion
        key={key}
        willEnter={getHeroImageEnteringStyle}
        willLeave={getHeroImageLeavingStyle}
        styles={styles}
      >
        {interpolatedStyles => (
          <div className="hero-image">
            {interpolatedStyles.map(this.renderActiveStoryHeroImage)}
            <div className="overlay" />
          </div>
        )}
      </TransitionMotion>
    );
  }

  renderActiveStoryHeroImage = (config) => {
    const offsetY = this.state.scrollingOffset / window.innerHeight * -100 / 2;
    const heroImageStyle = {
      ...config.style,
      backgroundImage: `url(${config.data.heroImage})`,
      transform: `translateY(${offsetY}px) scale(1.3)`, // Parallax effect
    };

    return (
      <div key={config.key} style={heroImageStyle} />
    );
  }

  renderActiveStoryIntroWrapper() {
    const { stories } = this.state;

    if (stories.length <= 0) {
      return null;
    }

    const story = stories[ACTIVE_STORY_INDEX];

    const styles = this.state.isSliding ? [] : [{
      key: story.key,
      data: story,
      style: {
        opacity: spring(1),
        x: spring(0),
      },
    }];

    return (
      <TransitionMotion
        willEnter={getStoryIntroEnteringStyle}
        willLeave={getStoryIntroLeavingStyle}
        styles={styles}
      >
        {interpolatedStyles => (
          <div className="story-intro" style={STORY_INTRO_ROOT_STYLE}>
            {interpolatedStyles.map(this.renderActiveStoryIntro)}
          </div>
        )}
      </TransitionMotion>
    );
  }

  renderActiveStoryIntro = ({ key, data, style }) => {
    const parsedStyle = {
      opacity: style.opacity,
      transform: `translateX(${style.x}px)`,
    };
    const story = data;

    return (
      <div key={key} style={parsedStyle}>
        <div>
          {!story.titleLogo ? (
            <h1>
              <Link
                style={{ color: 'inherit', textDecoration: 'inherit' }}
                to={`/story/${story.oice.uuid}?lang=${story.oice.language}`}
              >
                {story.name}
              </Link>
            </h1>
          ) : (
            <img src={story.titleLogo} alt={story.name} role="presentation" />
          )}
          {!!story.description &&
            <p className="story-description">{story.description}</p>
          }
        </div>
      </div>
    );
  }

  renderOicePlayer(story) {
    const { t } = this.props;
    const { isCallForActionShowed } = this.state;

    const oiceUuid = _get(story, 'oice.nextEpisode.uuid', story.oice.uuid);
    const oiceLanguage = _get(story, 'oice.language');
    const qrCodeLink = `${BRANCH_URL}?uuid=${oiceUuid}&$desktop_url=${OiceSingleViewUtils.getDesktopURL(oiceUuid, oiceLanguage)}`;

    return this.state.isOicePlayerShowed && (
      <div>
        <iframe
          loading="lazy"
          src={`https://cloud.oice.com/view/${story.oice.uuid}?lang=${story.oice.language}`}
          scrolling="no"
          seamless="seamless"
          title="story.oice.uuid"
        />
        <Motion style={{ opacity: spring(isCallForActionShowed ? 1 : 0) }}>
          {style => isCallForActionShowed && (
            <div className="download-app-overlay" style={style}>
              <div>
                <div className="qrcode-wrapper">
                  <Measure>
                    {({ width }) => <div><QRCode value={qrCodeLink} size={width} /></div>}
                  </Measure>
                </div>
                <OutlineButton
                  color="blue"
                  label={t('button.downloadApp')}
                  onClick={this.toggleSmsModal}
                />
              </div>
            </div>
          )}
        </Motion>
      </div>
    );
  }

  renderOiceIntro() {
    const { t } = this.props;

    return (
      <div className="oice-intro">
        <div className="oice-app-icon">
          <img src="/static/img/app-icon.png" role="presentation" alt="oice app icon" />
          <span>{t('label.appName')}</span>
        </div>
        {/* <div className="download-app-pitch">
          <span>{t('label.becomeAReader')}</span>
          <DownloadAppBadges
            logOnClickGooglePlayIcon={this.handleLogOnClickGooglePlayIcon}
            logOnClickAppStoreIcon={this.handleLogOnClickAppStoreIcon}
            isDarkBackground
          />
        </div> */}
      </div>
    );
  }

  renderSmsModal() {
    const { stories } = this.state;

    if (!stories || stories.length === 0) {
      return null;
    }

    return (
      <SmsModal
        open={this.state.isSmsModalOpened}
        oice={stories[ACTIVE_STORY_INDEX].oice}
        isEndedPlaying={this.state.isCallForActionShowed}
        onToggle={this.toggleSmsModal}
      />
    );
  }

  render() {
    const { t } = this.props;

    return (
      <div id="featured-stories">
        <div className="section-wrapper">
          <Header t={t} isGradient />
          {this.renderStorySlider()}
          {this.renderOiceIntro()}
        </div>
        {this.renderSmsModal()}
      </div>
    );
  }
}
