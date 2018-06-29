import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import Container from './Container';
import Separator from './Separator';

import { VERSION } from 'common/constants';


const footerLeftItems = [
  {
    key: 'termsOfService',
    link: '/terms',
  },
  {
    key: 'blog',
    link: 'https://v.oice.com',
  },
  {
    key: 'help',
    link: 'https://help.like.co',
  },
];

@translate(['Footer'])
export default class Footer extends React.Component {
  static defaultProps = {
    fluid: true,
  }

  static propTypes = {
    fluid: PropTypes.bool,
    id: PropTypes.string,
    t: PropTypes.func,
  }

  render() {
    const { id, fluid, t } = this.props;
    return (
      <div id={id} className="footer">
        <Separator />
        <Container fluid={fluid}>
          <div className="left">
            {footerLeftItems.map(item => (
              <div key={item.key} className="footer-item">
                <span>
                  <a href={item.link} rel="noopener noreferrer" target="_blank">
                    {t(`button.${item.key}`)}
                  </a>
                </span>
                <hr />
              </div>
            ))}
          </div>
          <div className="right">
            <span className="footer-email">
              <a href="mailto:hello@oice.com">hello@oice.com</a>
            </span>
            <span>{t('label.copyright')}</span>
            <span id="version">{t('label.version', { version: VERSION })}</span>
          </div>
        </Container>
      </div>
    );
  }
}
