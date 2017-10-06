import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { spring, TransitionMotion } from 'react-motion';

import _debounce from 'lodash/debounce';

import FlatButton from 'common/components/FlatButton';

import ScrollIndicatorIcon from './images/scroll-indicator';
import Slogan from './images/slogan';
import ReplayIcon from './images/replay';

import './Landing.styles.scss';


const SLIDESHOW_WIDTH_RATIO = 0.8; // In percentage
const SLIDESHOW_MAX_HEIGHT = 468; // In pixels
const SLIDESHOW_ASPECT_RATIO = 0.5625; // height / width

function getSlideEnteringStyle() {
  return { opacity: 0 };
}

function getSlideLeavingStyle() {
  return { opacity: spring(0) };
}

const TOTAL_SLIDES = 5;
const SLIDE_INTERVAL = 2500; // In millisecond

@translate('LandingSection')
export default class LandingSection extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    onClickRegisterReader: PropTypes.func,
    onClickScrollIndicator: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      sectionHeight: 0,
      width: 0,
      height: 0,

      slideshowTimer: null,
      currentSlideNumber: 1,
    };
  }

  componentDidMount() {
    this._resizeDebounce = _debounce(this._handleResize, 50);
    window.addEventListener('resize', this._resizeDebounce, false);
    this._handleResize();

    this._startPlayingSlideshow();
  }

  componentWillUnmount() {
    clearInterval(this.state.slideshowTimer);
  }

  _startPlayingSlideshow = () => {
    // Start playing
    this.setState({
      currentSlideNumber: 1,
      slideshowTimer: setInterval(this._playSlideshow, SLIDE_INTERVAL),
    });
  }

  _playSlideshow = () => {
    const { slideshowTimer, currentSlideNumber } = this.state;
    const nextState = {
      currentSlideNumber: currentSlideNumber + 1,
    };

    if (nextState.currentSlideNumber >= TOTAL_SLIDES && slideshowTimer) {
      // Stop playing
      clearInterval(slideshowTimer);
      nextState.slideshowTimer = null;
    }

    this.setState(nextState);
  }

  _handleResize = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const state = {
      sectionHeight: screenWidth > 1024 ? Math.max(640, screenHeight) - 48 : null,
    };

    let estimatedMaxWidth = Math.min(screenWidth, 1244);
    estimatedMaxWidth -= (40 * 2); // Padding
    estimatedMaxWidth *= (screenWidth > 768 ? 0.8 : 1);

    const maxWidth = screenWidth < 1024 ? estimatedMaxWidth : estimatedMaxWidth * SLIDESHOW_WIDTH_RATIO;
    const maxHeight = Math.max(400, (state.sectionHeight || 0) - 215 - 48);
    const aspectRatio = maxHeight / maxWidth;

    state.width = maxHeight;
    state.height = maxWidth;

    if (aspectRatio > SLIDESHOW_ASPECT_RATIO) {
      state.width = Math.min(maxHeight / SLIDESHOW_ASPECT_RATIO, estimatedMaxWidth);
      state.height = state.width * SLIDESHOW_ASPECT_RATIO;
    } else {
      state.height = maxWidth * SLIDESHOW_ASPECT_RATIO;
      state.width = state.height / SLIDESHOW_ASPECT_RATIO;
    }

    this.setState(state);
  }

  _renderSlide = (config) => {
    // TODO: Localized images
    const lang = 'zh-hk';

    const style = {
      ...config.style,
      backgroundImage: `url("/static/img/landing/${lang}/${config.data.slideNumber}.png")`,
    };
    return <div key={config.key} className="slide" style={style} />;
  }

  _renderSlideshow() {
    const { t } = this.props;
    const { width, height, currentSlideNumber } = this.state;

    const slideStyles = [currentSlideNumber].map(slideNumber => ({
      key: `${slideNumber}`,
      data: {
        slideNumber,
      },
      style: { opacity: spring(1) },
    }));

    return (
      <div className="slideshow" style={{ width, height }}>
        {/* Slogan */}
        <div className="slogan"><Slogan /></div>

        {/* Animated slides */}
        <TransitionMotion
          willEnter={getSlideEnteringStyle}
          willLeave={getSlideLeavingStyle}
          styles={slideStyles}
        >
          {interpolatedStyles =>
            <div className="slides">
              {interpolatedStyles.map(this._renderSlide)}
            </div>
          }
        </TransitionMotion>

        {/* Replay button */}
        {!this.state.slideshowTimer &&
          <FlatButton
            className="replay-button"
            label={t('button.replay')}
            icon={<ReplayIcon />}
            mini
            onClick={this._startPlayingSlideshow}
          />
        }

      </div>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <section id="landing-section">
        {/* For gradient in the bottom */}
        <div className="bg-fade" />

        <div className="section-wrapper">
          {/* Oice Idol */}
          <div className="idol" />

          {this._renderSlideshow()}

          {/* Login buttons */}
          <div className="registration-portal">
            <div>
              <a className="writer" href="/edit">{t('button.register')}</a>
              <a className="reader" onClick={this.props.onClickRegisterReader}>
                {t('button.becomeAReader')}
              </a>
            </div>
          </div>

          {/* Scroll indicator in the bottom */}
          <div
            className="scroll-indicator"
            onClick={this.props.onClickScrollIndicator}
          >
            <ScrollIndicatorIcon />
          </div>
        </div>
      </section>
    );
  }
}
