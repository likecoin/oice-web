import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { spring, TransitionMotion } from 'react-motion';

import classNames from 'classnames';
import _times from 'lodash/times';

import Header from './Header';

import './AssetSection.styles.scss';


function getSlideEnteringStyle() {
  return {
    opacity: 0,
    left: -50,
  };
}

function getSlideLeavingStyle() {
  return {
    opacity: spring(0),
    left: spring(-50),
  };
}

const TOTAL_SLIDES = 7;
const SLIDE_INTERVAL = 5000; // In millisecond, plese update CSS animation as well when change this value

@translate('AssetSection')
export default class AssetSection extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      currentSlideNumber: 0,
    };
  }

  componentDidMount() {
    this._startPlayingSlideshow();
  }

  componentWillUnmount() {
    clearInterval(this._slideshowTimer);
  }

  _startPlayingSlideshow = (startingSlideNumber = 0) => {
    if (this._slideshowTimer) {
      clearInterval(this._slideshowTimer);
    }
    this._slideshowTimer = setInterval(this._playSlideshow, SLIDE_INTERVAL);

    this.setState({ currentSlideNumber: startingSlideNumber });
  }

  _playSlideshow = () => {
    this.setState({
      currentSlideNumber: (this.state.currentSlideNumber + 1) % TOTAL_SLIDES,
    });
  }

  _renderSlide = (config) => {
    const { left, opacity } = config.style;

    // TODO: Localized images
    const lang = 'zh-HK';

    let url = `/static/img/featured-libraries/${lang}/${config.data.slideNumber + 1}`;

    const style = {
      opacity,
      backgroundImage: `url("${url}.png")`,
    };

    url += '-c';

    const previewStyle = {
      opacity,
      transform: `translateX(${left}px)`,
      backgroundImage: `url("${url}.png")`,
    };

    return (
      <div key={config.key} className="slide" style={style}>
        <div className="preview" style={previewStyle} />
      </div>
    );
  }

  _renderSlideshow() {
    const { t } = this.props;
    const { currentSlideNumber } = this.state;

    const slideStyles = [currentSlideNumber].map(slideNumber => ({
      key: `${slideNumber}`,
      data: {
        slideNumber,
      },
      style: {
        opacity: spring(1),
        left: spring(0),
      },
    }));

    return (
      <div className="slideshow">

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

        {/* Slideshow navigation */}
        <nav className="slide-navigator">
          {/* Slide indicators */}
          <ul>
            {_times(TOTAL_SLIDES).map((index) => {
              const className = classNames('slide-indicator', {
                active: index === currentSlideNumber,
              });

              return (
                <li key={index} onClick={() => this._startPlayingSlideshow(index)}>
                  <div className={className} />
                </li>
              );
            })}
          </ul>

          {/* More assets button */}
          <a className="more-asset-button" href="/store">
            {t('button.moreAssets')}
          </a>
        </nav>

      </div>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <section id="asset-section">
        <div className="section-wrapper">
          <Header t={t} isGradient />

          <div className="section-body">
            <aside>
              <h2>{t('label.assetStore')}</h2>
              <p>{t('label.assetStoreDescription')}</p>
            </aside>

            {this._renderSlideshow()}
          </div>

        </div>
      </section>
    );
  }
}
