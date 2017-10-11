import React from 'react';
import { render } from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { I18nextProvider } from 'react-i18next';
import UIDemo from './components/UIDemo';

import i18n from 'common/utils/i18n';
import styles from './styles/app.scss';


render((
  <MuiThemeProvider>
    <I18nextProvider i18n={i18n}>
      <UIDemo />
    </I18nextProvider>
  </MuiThemeProvider>
), document.getElementById('app'));

if (module.hot) {
  module.hot.accept();
}
