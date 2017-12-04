import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import {
  Element,
  Events,
  Helpers,
  animateScroll,
  scroller,
  scrollSpy,
} from 'react-scroll';

import classNames from 'classnames';
import _debounce from 'lodash/debounce';

import * as LogActions from 'common/actions/log';

import Separator from 'ui-elements/Separator';

import FeaturedStories from '../FeaturedStories';
import AssetSection from './AssetSection';
import LicenseSection from './LicenseSection';
import LandingSection from './Landing';
import Pricing from './Pricing';
import NewsHeader from './NewsHeader';

import './styles.scss';


const SECTION = {
  LANDING: 'LandingSection',
  ASSET: 'AssetSection',
  LICENSE: 'LicenseSection',
  STORY: 'FeaturedStories',
  PRICING: 'PricingSection',
};

const SECTIONS = [
  SECTION.LANDING,
  SECTION.ASSET,
  SECTION.LICENSE,
  SECTION.STORY,
  SECTION.PRICING,
];

const ANCHOR = {
  assetstore: SECTION.ASSET,
  attribution: SECTION.LICENSE,
  app: SECTION.STORY,
  backer: SECTION.PRICING,
};

const SCROLL_OPTIONS = {
  offset: -72,
  smooth: 'easeInOutQuad',
};

const INITIAL_SCROLL_TOP = 1;

const MenuItem = Helpers.Scroll((props) => {
  const className = classNames('navigation-indicator-item', props.className);
  return (
    <li {...{ ...props, title: null, className }}>
      <div dangerouslySetInnerHTML={{ __html: props.title }} />
    </li>
  );
});

@connect()
@translate()
export default class Home extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this._scrollY = INITIAL_SCROLL_TOP;
    this._isScrolling = false;
  }

  componentDidMount() {
    animateScroll.scrollTo(INITIAL_SCROLL_TOP); // NOTE: For scroll-spying on first element when first open

    Events.scrollEvent.register('begin', () => {
      this._isScrolling = true;
    });
    Events.scrollEvent.register('end', () => {
      this._isScrolling = false;
    });

    this._debouncedScrollListener = _debounce(this._handleScroll, 200, {
      maxWait: 0,
    });
    // window.addEventListener('scroll', this._debouncedScrollListener);

    this.props.dispatch(LogActions.logOiceWebAcquisition());

    // check hash anchor
    const { hash } = window.location;
    if (hash !== '') {
      setTimeout(() => {
        const hashLabel = hash.replace('#', '');
        const section = ANCHOR[hashLabel];
        if (section) {
          scroller.scrollTo(section, {
            ...SCROLL_OPTIONS,
            duration: 500,
          });
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this._debouncedScrollListener);
  }

  _handleScroll = (event) => {
    const { clientHeight, offsetTop } = document.getElementById('landing-section');
    const scrollY = (
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop
    );

    if (
      !this._isScrolling &&
      scrollY > INITIAL_SCROLL_TOP &&
      scrollY < (clientHeight + offsetTop) - 48 // Nav bar height
    ) {
      if (scrollY >= this._scrollY) {
        scroller.scrollTo(SECTION.ASSET, {
          ...SCROLL_OPTIONS,
          duration: 250,
          smooth: 'easeOutQuad',
        });
      } else {
        animateScroll.scrollToTop({
          ...SCROLL_OPTIONS,
          duration: 250,
          smooth: 'easeOutQuad',
        });
      }
    }
    this._scrollY = scrollY;
  }

  _handleClickScrollIndicator = () => {
    scroller.scrollTo(SECTION.ASSET, {
      ...SCROLL_OPTIONS,
      duration: 500,
    });
  }

  _handleClickRegisterReader = () => {
    scroller.scrollTo(SECTION.STORY, {
      ...SCROLL_OPTIONS,
      duration: 750,
    });
  }

  _renderNavigation() {
    const props = {
      ...SCROLL_OPTIONS,
      activeClass: 'active',
      duration: 500,
      spy: true,
    };

    return (
      <ul className="navigation-indicator">
        {SECTIONS.map(section =>
          <MenuItem
            key={section}
            to={section}
            title={this.props.t(`${section}:title`)}
            {...props}
          />
        )}
      </ul>
    );
  }

  render() {
    return (
      <div id="about">

        <Element name={SECTION.LANDING}>
          <NewsHeader />

          {this._renderNavigation()}

          <LandingSection
            onClickRegisterReader={this._handleClickRegisterReader}
            onClickScrollIndicator={this._handleClickScrollIndicator}
          />
        </Element>

        <Element name={SECTION.ASSET}>
          <AssetSection />
        </Element>

        <Separator />

        <Element name={SECTION.LICENSE}>
          <LicenseSection />
        </Element>

        <Separator />

        <Element name={SECTION.STORY}>
          <FeaturedStories />
        </Element>

        <Element
          name={SECTION.PRICING}
        >
          <Pricing />
        </Element>
      </div>
    );
  }
}
