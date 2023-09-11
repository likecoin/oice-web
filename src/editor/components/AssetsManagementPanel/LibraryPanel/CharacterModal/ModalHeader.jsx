import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import classNames from 'classnames';
import _values from 'lodash/values';

import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import FlatButton from 'ui-elements/FlatButton';
import ExpansionPanel from 'ui-elements/ExpansionPanel';

import FGImagesList from './FGImagesList';
import CharacterPositionPreview from './CharacterPositionPreview';
import EditCharacterNamesPanel from './EditCharacterNamesPanel';
import CoordinateConfigPanel from './CoordinateConfigPanel';

import * as constants from 'common/constants';

import {
  closeCharacterModal,
  toggleExpansionCharacterModal,
  postCharacter,
  deleteCharacter,
} from './actions';

import AlertDialog from 'ui-elements/AlertDialog';

import './styles.scss';


const isInteger = value => Number.isInteger(value) || value === '';

@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const {
    characterModal,
  } = store.libraryPanel;
  const {
    editing,
    loading,
  } = characterModal;
  return {
    editing,
    loading,
  };
})
export default class CharacterModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    limitedMode: PropTypes.bool,
    loading: PropTypes.bool,
    t: PropTypes.func.isRequired,
  }

  static defaultProps = {
    loading: false,
  }

  handleCloseButtonClick = () => {
    this.props.dispatch(closeCharacterModal());
  }

  render() {
    const {
      editing,
      limitedMode,
      loading,
      t,
    } = this.props;

    return (
      <Modal.Header
        loading={loading}
        onClickCloseButton={this.handleCloseButtonClick}
      >
        {limitedMode ? t('characterModal.title.view') : t(`characterModal.title.${editing ? 'edit' : 'add'}`)}
      </Modal.Header>
    );
  }
}
