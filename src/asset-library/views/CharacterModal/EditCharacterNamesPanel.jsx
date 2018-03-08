import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import CheckBox from 'ui-elements/Checkbox';
import TextField from 'ui-elements/TextField';

import * as Actions from './CharacterModal.actions';


@translate(['assetsManagement', 'editor'])
@connect(store => ({
  character: store.CharacterModal.character,
}))
export default class EditCharacterNamesPanel extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    character: PropTypes.object,
  }

  handleChange = (key, value) => {
    this.props.dispatch(Actions.updateCharacterKeyValue({ key, value }));
  }

  handleChangeGenericValue = value => this.handleChange('isGeneric', value)

  render() {
    const { character, t } = this.props;
    return (
      <div className="character-modal-panel-name">
        <div className="character-modal-panel-name-title">
          {t('characterModal.label.nameTitle')}
        </div>
        <div className="character-modal-panel-name-language">
          <div className="character-modal-panel-language-input">
            <TextField
              placeholder={t('characterModal.placeholder.name')}
              value={character.name}
              border
              fullWidth
              onChange={value => this.handleChange('name', value)}
            />
          </div>
        </div>
        <CheckBox
          id="character-generic-checkbox"
          isChecked={character.isGeneric}
          label={t('characterModal.label.renamable')}
          onChange={this.handleChangeGenericValue}
        />
        <div className="character-description">
          <div className="character-modal-panel-description-title">
            {t('characterModal.label.descriptionTitle')}
          </div>
          <TextField
            fullWidth
            multiLine
            maxLength={1024}
            placeholder={t('characterModal.label.pleaseEnterCharacterDescription')}
            value={character.description}
            onChange={value => this.handleChange('description', value)}
          />
        </div>
      </div>
    );
  }
}
