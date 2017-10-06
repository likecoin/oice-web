import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import TextField from 'ui-elements/TextField';
import CheckBox from 'ui-elements/Checkbox';

import {
  updateCharacterKeyValue,
} from './actions';

const languageCodes = [
  'En',
  'Tw',
  'Jp',
];

const getLanguageKey = (code) => `name${code}`;

@translate(['assetsManagement', 'editor'])
@connect((store) => ({
  character: store.libraryPanel.characterModal.character,
}))
export default class EditCharacterNamesPanel extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    character: PropTypes.object,
  }

  handleChange = (key, value) => {
    this.props.dispatch(updateCharacterKeyValue({ key, value }));
  }

  handleChangeGenericValue = (value) => this.handleChange('isGeneric', value)

  render() {
    const { character, t } = this.props;
    return (
      <div className="character-modal-panel-name">
        <div className="character-modal-panel-name-title">
          {t('characterModal.label.nameTitle')}
        </div>
        {[languageCodes[0]].map((code) => {
          const key = getLanguageKey(code);
          return (
            <div
              className="character-modal-panel-name-language"
              key={key}
            >
              {/* <div className="character-modal-panel-language-title">
                {t(`characterModal.label.${key}`)}
              </div> */}
              <div className="character-modal-panel-language-input">
                <TextField
                  placeholder={t('characterModal.placeholder.name')}
                  value={character[key]}
                  border
                  fullWidth
                  onChange={(value) => this.handleChange(key, value)}
                />
              </div>
            </div>
          );
        })}
        <CheckBox
          id="character-generic-checkbox"
          isChecked={character.isGeneric}
          label={t('characterModal.label.renamable')}
          onChange={this.handleChangeGenericValue}
        />
      </div>
    );
  }
}
