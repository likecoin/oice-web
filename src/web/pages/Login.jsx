import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AlertDialog from 'ui-elements/AlertDialog';
import LoadingScreen from 'ui-elements/LoadingScreen';

import { IS_DEV_MODE } from 'common/constants';
import { redirectPathname } from 'common/utils/auth';
import firebase from 'common/utils/firebase';

import * as UserAction from 'common/actions/user';

@connect()
export default class Login extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    if (!IS_DEV_MODE) {
      firebase.auth().onIdTokenChanged((firebaseCurrentUser) => {
        if (!firebaseCurrentUser) {
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.addScope('profile');
          provider.addScope('email');
          provider.setCustomParameters({
            prompt: 'select_account',
          });
          firebase.auth().signInWithRedirect(provider);
        } else {
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
                  } else {
                    console.error('oice user not found');
                  }
                });
            } else {
              console.error('credential not found');
              window.location.href = redirectPathname.get() || '/';
            }
          }).catch((error) => {
            console.error(error);
            this.props.dispatch(AlertDialog.toggle({ open: true, body: error.message }));
          });
        }
      });
    } else {
      this.props.dispatch(UserAction.loginWithGoogle({
        providerData: [{
          email: 'oice-dev',
          displayName: 'oice-dev',
          photoURL: '',
          providerId: 'oice-dev',
        }],
      }, 'dev'));
    }
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
