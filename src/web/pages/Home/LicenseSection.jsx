import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';

import Caption from './Caption';
import Header from './Header';

import './LicenseSection.styles.scss';


const LICENSE_PROPERTIES = [
  'openness',
  'tagging',
  'approval',
  'profitSharing',
  'collaborative',
];

const LICENSES_TABLE = [
  {
    title: 'copyright',
    highlighted: false,
    openness: 'open.closed',
    tagging: 'customize',
    approval: 'caseByCase',
    profitSharing: 'customize',
    collaborative: 'low',
  },
  {
    title: 'oiceCommons',
    highlighted: true,
    openness: 'open.coordinated',
    tagging: 'customize',
    approval: 'approveFirst',
    profitSharing: 'yes',
    collaborative: 'high',
  },
  {
    title: 'creativeCommons',
    highlighted: false,
    openness: 'open.fully',
    tagging: 'manually',
    approval: 'no',
    profitSharing: 'no',
    collaborative: 'high',
  },
];

@translate('LicenseSection')
export default class LicenseSection extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  _renderLicenseColumn = (license) => {
    const { t } = this.props;
    const { highlighted, title } = license;
    const className = classNames('license-column', title, {
      highlighted,
    });
    return (
      <div key={title} className={className}>
        <header>
          <h2>{t(`label.${title}`)}</h2>
        </header>

        <ul>
          {LICENSE_PROPERTIES.map(property => (
            <li key={property}>
              <h3>{t(`label.${property}`)}</h3>
              <span>{t(`label.${license[property]}`)}</span>
            </li>
          ))}
        </ul>

        {title === 'oiceCommons' &&
          <Caption
            title={t('label.oiceCommonsPolicyCaption.title')}
            details={t('label.oiceCommonsPolicyCaption.details')}
            isAbsolute
          />
        }
      </div>
    );
  }

  render() {
    const { t } = this.props;

    // TODO: Add localized screenshots
    const lang = 'zh-HK';

    const screenshot = `/static/img/app/single-view/${lang}.jpg`;

    return (
      <section id="license-section">
        <div className="section-wrapper">
          <Header t={t} />

          <div className="section-body">
            <div className="bg-overlay" />

            {/* <div className="licenses-table">
              <div>
                {LICENSES_TABLE.map(this._renderLicenseColumn)}
              </div>
            </div> */}

            <div className="credits-demo">
              <div className="portrait-phone">
                <img src={screenshot} alt="oice App" />
                <div
                  className="magnifiying-glass"
                  style={{ backgroundImage: `url(${screenshot})` }}
                />
              </div>

              <Caption
                title={t('label.autoCreditsCaption.title')}
                details={t('label.autoCreditsCaption.details')}
                isAbsolute
              />
            </div>
          </div>

        </div>
      </section>
    );
  }
}
