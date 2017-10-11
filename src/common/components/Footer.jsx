import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import classNames from 'classnames';
import Container from './Container';

import Separator from './Separator';

import { VERSION } from 'common/constants';


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
            <span>
              <a href="/terms">{t('button.termsOfService')}</a>
            </span>
            <hr />
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
