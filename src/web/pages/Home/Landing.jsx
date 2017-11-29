import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FlatButton from 'common/components/FlatButton';

import Carousel from './LandingCarousel';

import ScrollIndicatorIcon from './images/scroll-indicator';
import Slogan from './images/slogan';

import './Landing.styles.scss';


function LandingSection(props) {
  const { t } = props;

  return (
    <section id="landing-section">

      <div className="carousel-wrapper">
        <Carousel />
      </div>

      <div className="section-wrapper">
        <div>

          {/* Oice Idol */}
          <div className="idol" />

          {/* Slogan */}
          <div className="slogan"><Slogan /></div>

          {/* Login buttons */}
          <div className="registration-portal">
            <div>
              <a className="writer" href="/edit">{t('button.register')}</a>
              <a className="reader" onClick={props.onClickRegisterReader}>
                {t('button.becomeAReader')}
              </a>
            </div>
          </div>

          {/* Scroll indicator in the bottom */}
          <div
            className="scroll-indicator"
            role="button"
            onClick={props.onClickScrollIndicator}
          >
            <ScrollIndicatorIcon />
          </div>

        </div>
      </div>

    </section>
  );
}

LandingSection.propTypes = {
  t: PropTypes.func.isRequired,
  onClickRegisterReader: PropTypes.func,
  onClickScrollIndicator: PropTypes.func,
};

export default translate('LandingSection')(LandingSection);
