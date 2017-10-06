/* global firebase: true */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AlertDialog from 'ui-elements/AlertDialog';
import LoadingScreen from 'ui-elements/LoadingScreen';

import {
  redirectPathname,
 } from 'common/utils/auth';

import * as UserAction from 'common/actions/user';


@connect()
export default class Login extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    firebase.auth().onIdTokenChanged((firebaseCurrentUser) => {
      if (!firebaseCurrentUser) {
        const provider = new firebase.auth.GoogleAuthProvider();
        // https://developers.google.com/identity/protocols/googlescopes
        provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
        provider.addScope('email');
        provider.setCustomParameters({
          prompt: 'select_account',
        });
        firebase.auth().signInWithRedirect(provider);
      } else {
        console.log('here');
        firebase.auth().getRedirectResult().then((result) => {
          if (result.credential) {
            const firebaseUser = firebase.auth().currentUser;
            const googleToken = result.credential.accessToken;
            // Create account here
            this.props.dispatch(UserAction.loginWithGoogle(firebaseUser, googleToken))
            .then((oiceUser) => {
              if (oiceUser) {
                const redirectPath = redirectPathname.get() || '/';
                window.location.href = redirectPath;
              }
            });
          } else {
            window.location.href = redirectPathname.get() || '/';
          }
        }).catch((error) => {
          this.props.dispatch(AlertDialog.toggle({ open: true, body: error.message }));
        });
      }
    });
  }

  render() {
    return (
      <div id="login">
        <LoadingScreen />
        <AlertDialog />
      </div>
    );
  }
}
