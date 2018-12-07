import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Container from 'ui-elements/Container';
import { setInnerHTML } from 'common/utils';

// XXX: Not ready for localization
import content from './content/zh-HK.md';
import privacy from './content/privacy/en.md';

import './style.scss';


@translate(['TermsOfService'])
export default class TermsOfService extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  render() {
    const { t } = this.props;
    return (
      <Container>
        <section id="terms-of-service">
          <h1>{t('title')}</h1>
          <article {...setInnerHTML(content)} />
        </section>
        <section id="privacy-policy">
          <h1>{t('privacy')}</h1>
          <article {...setInnerHTML(privacy)} />
        </section>
      </Container>
    );
  }
}
