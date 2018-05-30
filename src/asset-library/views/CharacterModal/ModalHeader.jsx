import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Modal from 'ui-elements/Modal';

import * as Actions from './CharacterModal.actions';


const isInteger = value => Number.isInteger(value) || value === '';

@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const {
    editing,
    loading,
  } = store.CharacterModal;
  return {
    editing,
    loading,
  };
})
export default class CharacterModalHeader extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    characterId: PropTypes.number,
    limitedMode: PropTypes.bool,
    loading: PropTypes.bool,
  }

  static defaultProps = {
    loading: false,
  }

  handleCloseButtonClick = () => {
    this.props.dispatch(Actions.closeCharacterModal());
  }

  render() {
    const { characterId, editing, limitedMode, loading, t } = this.props;

    let modalHeader = (
      limitedMode ?
      t('characterModal.title.view') :
      t(`characterModal.title.${editing ? 'edit' : 'add'}`)
    );
    if (editing) modalHeader = `${modalHeader} (${characterId})`;

    return (
      <Modal.Header loading={loading} onClickCloseButton={this.handleCloseButtonClick}>
        {modalHeader}
      </Modal.Header>
    );
  }
}
