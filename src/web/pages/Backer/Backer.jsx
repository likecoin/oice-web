import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';
import LoadingScreen from 'ui-elements/LoadingScreen';
import SubNavBar from 'ui-elements/SubNavBar';
import PricingTable from 'web/components/PricingTable';

import firebase from 'common/utils/firebase';

import * as UserAction from 'common/actions/user';

import './Backer.styles.scss';

@connect(store => ({
  user: store.user,
}))
@translate(['general', 'BackerPage'])
export default class BackerPage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const { action } = this.props.location.query;
    if (action === 'subscribe') {
      if (this.props.user.isLoggedIn) {
        this.subscribe();
      } else {
        this.login();
      }
    }
  }

  onClickButton = async () => {
    if (this.props.user.isLoggedIn) {
      this.subscribe();
    } else {
      this.login();
    }
  }

  async login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await firebase.auth().signInWithPopup(provider);
      if (!result.credential) return;
      const firebaseUser = firebase.auth().currentUser;
      const googleToken = result.credential.accessToken;
      await this.props.dispatch(UserAction.loginWithGoogle(firebaseUser, googleToken));
      this.subscribe();
    } catch (error) {
      this.props.dispatch(AlertDialog.toggle({ open: true, body: error.message }));
    }
  }

  subscribe() {
    let path = '/profile?action=subscribe';
    const { referrer } = this.props.location.query;
    if (referrer) path = `${path}&referrer=${referrer}`;
    this.props.dispatch(push(path));
  }

  render() {
    const { t } = this.props;

    if (!this.props.user.isAuthenticated) {
      return <LoadingScreen />;
    }

    return (
      <div id="backer-page">
        <SubNavBar text={t('title')} fluid />
        <div className="backer-page-content">
          <div>
            <h1 dangerouslySetInnerHTML={{ __html: t('PricingSection:title') }} />
            <PricingTable
              onClickRegistrationButton={this.onClickButton}
              onClickBecomeOiceBackerButton={this.onClickButton}
            />
          </div>
        </div>
      </div>
    );
  }
}
