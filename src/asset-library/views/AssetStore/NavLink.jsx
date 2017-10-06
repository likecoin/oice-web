import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import classNames from 'classnames';

import FlatButton from 'ui-elements/FlatButton';


function AssetStoreNavLink(props) {
  const { label } = props;

  let to = '/store';
  if (props.to) {
    to += `/collection/${props.to}`;
  }

  const activeClassName = 'active';

  return (
    <Link className="asset-store-sidebar-menu-item" {...{ activeClassName, to }}>
      <FlatButton label={label} />
    </Link>
  );
}

AssetStoreNavLink.propTypes = {
  label: PropTypes.string,
  to: PropTypes.string,
};

AssetStoreNavLink.defaultProps = {
  label: '',
  to: '',
};

export default AssetStoreNavLink;
