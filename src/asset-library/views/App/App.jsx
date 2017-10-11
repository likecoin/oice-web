/* global firebase: true */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { replace } from 'react-router-redux';

import AlertDialog from 'ui-elements/AlertDialog';
import Footer from 'ui-elements/Footer';
import InteractiveTutorial from 'editor/components/InteractiveTutorial';
import NavBar from 'ui-elements/NavBar';

import * as IntercomUtils from 'common/utils/intercom';
import * as UserAction from 'common/actions/user';

import {
  getAuthItem,
  getLocalUserItem,
  redirectToLoginPage,
 } from 'common/utils/auth';

import './App.style.scss';


const isIOS = /(iPhone|iPad)/i.test(navigator.userAgent);

@connect(({ user }) => ({ user }))
@translate()
@DragDropContext(isIOS ? TouchBackend : HTML5Backend)
export default class AssetLibraryApp extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    children: PropTypes.node,
    user: PropTypes.object,
  }

  static childContextTypes = {
    module: PropTypes.string,
  }

  componentDidMount() {
    this.props.dispatch(UserAction.authenticate());
    IntercomUtils.boot();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.user.isAuthenticated &&
      !nextProps.user.isLoggedIn &&
      /asset.*/.test(window.location.pathname)
    ) {
      this.props.dispatch(replace('/store'));
    }
  }

  getChildContext() {
    return { module: 'asset' };
  }

  render() {
    const { user, t } = this.props;
    return (
      <div id="asset-library">
        <NavBar id="asset-library-navbar" user={user} fixed fluid />
        {this.props.children}
        <AlertDialog />
        <InteractiveTutorial />
        {/* <Footer /> */}
      </div>
    );
  }
}
