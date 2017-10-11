import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';
import FlatButton from 'ui-elements/FlatButton';
import TextField from 'ui-elements/TextField';
import OutlineButton from 'ui-elements/OutlineButton';

import AddIcon from 'common/icons/add';


function ProfilePanel(props) {
  const {
    t,
    children,
    disableSaveButton,
    header,
    onClickSave,
  } = props;
  const className = classNames('profile-panel', props.className);

  return (
    <div className={className}>
      <div className="panel-header">
        <h2>{header}</h2>
        {onClickSave &&
          <OutlineButton
            color={'green'}
            disabled={disableSaveButton}
            label={t('save')}
            onClick={onClickSave}
          />
        }
      </div>
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
}

ProfilePanel.propTypes = {
  t: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.object,
  disableSaveButton: PropTypes.bool,
  header: PropTypes.string,
  onClickSave: PropTypes.func,
};

export default translate('general')(ProfilePanel);
