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
    selectedLibrary,
    characterModal,
  } = store.libraryPanel;
  const libraryId = (selectedLibrary || {}).id;
  const {
    character,
    deletedFGImageIds,
    editing,
    fgImages,
    loading,
  } = characterModal;
  return {
    libraryId,
    character,
    deletedFGImageIds,
    fgImages,
    editing,
    loading,
  };
})
export default class CharacterModal extends React.Component {
  static propTypes = {
    character: PropTypes.object.isRequired,
    deletedFGImageIds: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    fgImages: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    libraryId: PropTypes.number,
    limitedMode: PropTypes.bool,
    loading: PropTypes.bool,
  }

  static defaultProps = {
    loading: false,
  }


  handleConfirmButtonClick = () => {
    const {
      character,
      dispatch,
      fgImages,
      libraryId, // useful for adding new character only
      deletedFGImageIds,
      t,
    } = this.props;

    const fgImagesValid = fgImages.every((fgImage) => {
      const trimmedName = fgImage.meta.name.trim();
      return trimmedName && trimmedName.length > 0;
    });

    const isConfigAllInteger = _values(character.config).every(isInteger);
    console.debug('isConfigAllInteger%o', character.config);
    const characterNameValid = character.name && character.name.trim().length > 0;

    if (fgImages.length === 0) {
      dispatch(AlertDialog.toggle({
        body: t('characterModal.label.pleaseAddAtLeastOneFgImage'),
        type: 'alert',
      }));
    } else if (!fgImagesValid) {
      dispatch(AlertDialog.toggle({
        body: t('characterModal.label.fgImageCannotBeEmpty'),
        type: 'alert',
      }));
    } else if (!characterNameValid) {
      dispatch(AlertDialog.toggle({
        body: t('characterModal.label.pleaseEnterCharacterName'),
        type: 'alert',
      }));
    } else if (!isConfigAllInteger) {
      dispatch(AlertDialog.toggle({
        body: t('characterModal.label.pleaseEnterIntegerConfig'),
        type: 'alert',
      }));
    } else {
      dispatch(postCharacter({ ...character, libraryId }, fgImages, deletedFGImageIds));
    }
  }

  handleDeleteButtonClick = () => {
    const {
      character,
      dispatch,
      t,
    } = this.props;

    dispatch(AlertDialog.toggle({
      body: t('characterModal.label.deleteCharacter'),
      confirmCallback: () => {
        dispatch(deleteCharacter(character.id));
      },
    }));
  }

  render() {
    const {
      character,
      editing,
      limitedMode,
      loading,
      fgImages,
      t,
    } = this.props;

    const flatButton = (!limitedMode && editing &&
      <FlatButton
        disabled={loading}
        label={t('characterModal.button.delete')}
        onClick={this.handleDeleteButtonClick}
      />
    );
    const isSomeFgImageHasNoCredit = fgImages.some(fgImage => (!fgImage.meta.users || fgImage.meta.users.length === 0));
    const confirmButton = (!limitedMode &&
      <RaisedButton
        disabled={loading || isSomeFgImageHasNoCredit}
        label={t('characterModal.button.confirm')}
        primary
        onClick={this.handleConfirmButtonClick}
      />
    );

    return (
      <Modal.Footer
        leftItems={[flatButton]}
        rightItems={[confirmButton]}
      />
    );
  }
}
