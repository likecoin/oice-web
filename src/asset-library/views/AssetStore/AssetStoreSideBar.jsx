import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _values from 'lodash/values';

import FlatButton from 'ui-elements/FlatButton';
import {
  STORE_LIBRARY_LIST_TYPE,
  STORE_LIBRARY_LIST,
} from 'asset-library/constants';

import NavLink from './NavLink';

@connect(store => ({
  featuredLibraryList: store.AssetStore.featuredLibraryList,
}))
@translate(['AssetStore'])
export default class AssetStoreSideBar extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    featuredLibraryList: PropTypes.array.isRequired,
  };

  render() {
    const { t, featuredLibraryList } = this.props;

    return (
      <div id="asset-store-sidebar">
        <ol className="asset-store-sidebar-menu">
          {featuredLibraryList.map((type, index) => (
            // re-render the NavLinks when location changes
            <li key={index} onClick={() => this.forceUpdate()}>
              <NavLink label={type.name} to={`featured/${type.alias}`} />
            </li>
          ))}
        </ol>
        <ol className="asset-store-sidebar-menu">
          {STORE_LIBRARY_LIST.map(type => (
            <li key={`asset-store-sidebar-type-${type}`} onClick={() => this.forceUpdate()}>
              <NavLink label={t(`menu.${type}`)} to={type} />
            </li>
          ))}
        </ol>
        <ol className="asset-store-sidebar-menu">
          <li onClick={() => this.forceUpdate()}>
            <NavLink label={t('menu.all')} to="" />
          </li>
        </ol>
        <div className="dummy" />
      </div>
    );
  }
}
