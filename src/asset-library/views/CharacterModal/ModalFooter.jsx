import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import _values from 'lodash/values';

import AlertDialog from 'ui-elements/AlertDialog';
import FlatButton from 'ui-elements/FlatButton';
import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';

import * as constants from 'common/constants';

import * as Actions from './CharacterModal.actions';


const isInteger = value => Number.isInteger(value) || value === '';

@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const {
    character,
    deletedFGImageIds,
    editing,
    fgImages,
    loading,
  } = store.CharacterModal;
  return {
    character,
    deletedFGImageIds,
    fgImages,
    editing,
    loading,
  };
})
export default class CharacterModalFooter extends React.Component {
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
      const trimmedName = fgImage.meta.nameEn.trim();
      return trimmedName && trimmedName.length > 0;
    });

    const isConfigAllInteger = _values(character.config).every(isInteger);
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
      dispatch(Actions.postCharacter({ ...character, libraryId }, fgImages, deletedFGImageIds));
    }
  }

  handleDeleteButtonClick = () => {
    const { character, deletedFGImageIds, fgImages, libraryId, dispatch, t } = this.props;
    let assetCount = -deletedFGImageIds.length;
    fgImages.forEach((fg) => {
      if (fg.meta.id) {
        assetCount--;
      }
    });

    dispatch(AlertDialog.toggle({
      body: t('characterModal.label.deleteCharacter'),
      confirmCallback: () => {
        dispatch(Actions.deleteCharacter({
          id: character.id,
          assetCount,
          libraryId,
        }));
      },
    }));
  }

  render() {
    const { character, editing, limitedMode, loading, fgImages, t } = this.props;

    const flatButton = (!limitedMode && editing &&
      <FlatButton
        disabled={loading}
        label={t('characterModal.button.delete')}
        onClick={this.handleDeleteButtonClick}
      />
    );
    const isOneOfFgImagesHasNoCredit = fgImages.some(fgImage => (
      (fgImage.meta.users && fgImage.meta.users.length === 0) &&
      fgImage.meta.creditsUrl.length === 0
    ));
    const confirmButton = (!limitedMode &&
      <RaisedButton
        disabled={loading || isOneOfFgImagesHasNoCredit}
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
