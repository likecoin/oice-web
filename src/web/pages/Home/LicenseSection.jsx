/* global firebase: true */

import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';

import { SparkScroll } from 'common/utils/sparkScroll';

import Caption from './Caption';
import Header from './Header';

import './LicenseSection.styles.scss';


@translate('LicenseSection')
export default class LicenseSection extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      angle: 20,
      authors: [
        /*
        Example of author:
        {
          "avatar": "",
          "position": {
            "row": "top",
            "column": "left"
          }
        }
        */
      ],
    };
  }

  componentDidMount() {
    this._fetchContent();
  }

  async _fetchContent() {
    const content = await firebase.database()
                                  .ref('license-section')
                                  .once('value')
                                  .then(snapshot => snapshot.val())
                                  .catch(() => null);
    if (content) this.setState(content);
  }

  _renderAuthor = ({ avatar, position, type }) => {
    if (!(position instanceof Object)) return null;

    const className = classNames('author', Object.values(position));

    const { angle } = this.state;
    const radian = (isNaN(angle) ? 20 : parseInt(angle, 10)) * (Math.PI / 180);
    const sinAngle = Math.sin(radian);
    const cosAngle = Math.cos(radian);

    // Calculate the position of the author
    const style = {
      marginLeft: 50,
      marginTop: position.row === 'middle' ? 0 : 50,
    };

    if (position.column === 'left') {
      style.marginLeft *= -1;
    }

    if (position.row !== 'middle') {
      style.marginLeft *= cosAngle;
      style.marginTop *= sinAngle;

      if (position.row === 'top') {
        style.marginTop *= -1;
      }
    }

    style.marginLeft += '%';
    style.marginTop += '%';

    const typeName = this.props.t(`oiceSingleView:credit.${type}`);

    return (
      <SparkScroll.li key={className} className={className} style={style}>
        <SparkScroll.div
          timeline={{
            ease: 'easeInQuad',
            topBottom: { opacity: 0, transform: 'scale(0)' },
            'centerCenter-150': { opacity: 1, transform: 'scale(1)' },
          }}
        >
          <div>
            <img alt={typeName} src={avatar} />
            <span>{typeName}</span>
          </div>
        </SparkScroll.div>
      </SparkScroll.li>
    );
  }

  _renderAuthorsRing() {
    const { authors } = this.state;

    if (!Array.isArray(authors)) return null;

    return (
      <div className="ring">
        <SparkScroll.div
          timeline={{
            ease: 'easeOutQuad',
            topBottom: { transform: 'scale(0)' },
            'centerCenter-150': { transform: 'scale(1)' },
          }}
        >
          <ul>{authors.map(this._renderAuthor)}</ul>
        </SparkScroll.div>
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

            <SparkScroll.div
              className="credits-demo"
              timeline={{
                ease: 'easeOutQuad',
                topBottom: { opacity: 0, transform: 'translateY(100px)' },
                'centerCenter-150': { opacity: 1, transform: 'translateY(0)' },
              }}
            >

              {this._renderAuthorsRing()}

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
            </SparkScroll.div>

          </div>

        </div>
      </section>
    );
  }
}
