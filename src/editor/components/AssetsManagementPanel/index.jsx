import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AssetsNavBar from './NavBar';
import LibraryModal from './LibraryModal';
import Footer from 'common/components/Footer';

export default class AssetsIndex extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  static childContextTypes = {
    module: PropTypes.string,
  }

  getChildContext() {
    return { module: 'asset' };
  }

  componentWillMount() {
    window.location.href = '/asset';
  }

  render() {
    return (
      <div id="assets-management-panel">
        {/* <AssetsNavBar />
          {this.props.children}
          <LibraryModal />
        <Footer /> */}
      </div>
    );
  }
}
