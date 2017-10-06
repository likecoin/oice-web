import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Progress from '../Progress';

import './styles.scss';

@translate('loadingScreen')
export default class LoadingScreen extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  render() {
    const { t } = this.props;
    return (
      <div id="loading-screen">
        <div id="loading-screen-status">
          <Progress.LoadingIndicator />
          <h5>
            {t('label.loading')}
          </h5>
        </div>
      </div>
    );
  }
}
