import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';

import AlertDialog from 'ui-elements/AlertDialog';
import NavBar from 'ui-elements/NavBar';

import * as UserAction from 'common/actions/user';
import * as IntercomUtils from 'common/utils/intercom';
import {
  getAuthItem,
  getLocalUserItem,
  redirectToLoginPage,
} from 'common/utils/auth';

import './styles/app.scss';


const isIOS = /(iPhone|iPad)/i.test(navigator.userAgent);
const isSingleView = () => /(story\/.*|terms$)/.test(window.location.pathname);


@connect(store => ({
  user: store.user,
}))
@DragDropContext(isIOS ? TouchBackend : HTML5Backend)
export default class App extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    Footer: PropTypes.node,
    children: PropTypes.node,
    user: PropTypes.object,
  }

  componentDidMount() {
    this.props.dispatch(UserAction.authenticate());
    if (!isSingleView()) IntercomUtils.boot();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.user.isAuthenticated &&
      !this.props.user.isAuthenticated &&
      window.location.pathname === '/'
    ) {
      if (nextProps.user.isLoggedIn) {
        window.location.pathname = '/edit/dashboard';
      } else {
        this.props.dispatch(replace('/about'));
      }
    }
  }

  render() {
    return (
      <div id="web">
        {!isSingleView() && (
          <NavBar id="web-navbar" user={this.props.user} fixed fluid />
        )}
        {this.props.user.isAuthenticated && this.props.children}
        {this.props.Footer}
        <AlertDialog />
      </div>
    );
  }
}
