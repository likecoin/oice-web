import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';

import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';
import LoadingScreen from 'ui-elements/LoadingScreen';

import * as StoryAction from 'editor/actions/story';
import * as LibraryAction from 'editor/actions/library';
import * as MacroAction from 'editor/actions/macro';
import * as UserAction from 'common/actions/user';

import { isMobileAgent } from 'common/utils';
import { redirectToLoginPage } from 'common/utils/auth';

import InteractiveTutorial from './InteractiveTutorial';


const isIOS = /(iPhone|iPad)/i.test(navigator.userAgent);

@connect(({ user }) => ({ user }))
@DragDropContext(isIOS ? TouchBackend : HTML5Backend)
export default class App extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.node,
    user: PropTypes.object,
  }

  static childContextTypes = {
    appModule: PropTypes.string,
  }

  constructor(props) {
    super(props);

    if (isMobileAgent()) {
      window.location.pathname = '/user';
    }

    this.state = {
      hasToShowTutorial: true,
    };
  }

  getChildContext() {
    return {
      appModule: 'edit',
    };
  }

  componentDidMount() {
    this.props.dispatch(UserAction.authenticate());
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user.isAuthenticated) return;

    if (nextProps.user.isLoggedIn) {
      if (!this.props.user.isLoggedIn) {
        const { dispatch } = this.props;
        dispatch(StoryAction.fetchStories());
        dispatch(LibraryAction.fetchLibraries());
        dispatch(MacroAction.fetchMacros());
        this.checkWhetherInteractiveTutorialShouldStart(nextProps);
      }
    } else {
      redirectToLoginPage();
    }
  }

  checkWhetherInteractiveTutorialShouldStart(props) {
    const { dispatch, user, location } = props;
    if (_get(location, 'query.action') === 'first-time-tutorial' && this.state.hasToShowTutorial) {
      dispatch(InteractiveTutorial.Action.open(1));
      this.setState({ hasToShowTutorial: false });
    }
  }

  render() {
    const { user } = this.props;
    return (
      <div id="app-container">
        {!user.isLoggedIn ? <LoadingScreen /> : this.props.children}
        <AlertDialog />
        <InteractiveTutorial />
      </div>
    );
  }
}
