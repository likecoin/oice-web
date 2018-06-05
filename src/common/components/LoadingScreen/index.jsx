import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Progress from '../Progress';
import OutlineButton from '../OutlineButton';

import './styles.scss';

@translate('loadingScreen')
export default class LoadingScreen extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    showReload: PropTypes.bool,
    timeout: PropTypes.number,
  }

  static defaultProps = {
    timeout: 10000,
  }

  constructor(props) {
    super(props);

    this.timer = undefined;
    this.state = {
      showRefreshButton: false,
    };
  }

  componentDidMount() {
    const { showReload, timeout } = this.props;
    if (showReload) {
      this.timer = setTimeout(() => {
        this.setState({ showRefreshButton: true });
      }, timeout);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  refresh = () => {
    window.location.reload();
  }

  render() {
    const { t } = this.props;
    const { showRefreshButton } = this.state;
    return (
      <div id="loading-screen">
        <div id="loading-screen-status">
          <Progress.LoadingIndicator />
          <h5>
            {t('label.loading')}
          </h5>
          {showRefreshButton && (
            <OutlineButton
              color="green"
              label={t('label.reload')}
              onClick={this.refresh}
            />
          )}
        </div>
      </div>
    );
  }
}
