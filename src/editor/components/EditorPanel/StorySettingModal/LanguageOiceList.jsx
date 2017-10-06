import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import LinkTooltip from 'ui-elements/LinkTooltip';
import TextField from 'ui-elements/TextField';
import WordCount from './WordCount';

import * as Actions from './StorySettingModal.actions';

import './StorySettingModal.style.scss';

function OiceListItem({ t, oice, index, onChangeName, onMouseEnterOice }) {
  function handleChangeName(name) {
    if (onChangeName) {
      onChangeName({
        oiceId: oice.id,
        oiceName: name,
      });
    }
  }

  return (
    <div
      className="language-oice-item"
      onMouseEnter={() => onMouseEnterOice(oice, index)}
    >
      <div className="left-column">
        <WordCount count={oice.wordCount} />
      </div>
      <div className="right-column">
        <span>{index + 1}</span>
        <div className="oice-name-field">
          <TextField
            placeholder={t('placeholder.name')}
            value={oice.name}
            fullWidth
            onChange={handleChangeName}
          />
          <div className="oice-link-wrapper">
            <LinkTooltip
              disabled={!oice.hasPublished}
              link={oice.shareUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

OiceListItem.propTypes = {
  index: PropTypes.number.isRequired,
  oice: PropTypes.object.isRequired,
  onChangeName: PropTypes.func.isRequired,
  onMouseEnterOice: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const OiceListItemElement = translate('OiceSettingTab')(OiceListItem);

function LanguageOiceList({ t, oices, onChangeName, onMouseEnterOice }) {
  return (
    <div className="language-oice-list">
      <div className="oice-list-title">{t('label.episodeName')}</div>
      {oices.map((oice, index) => (
        <OiceListItemElement
          key={oice.id}
          oice={oice}
          index={index}
          onChangeName={onChangeName}
          onMouseEnterOice={onMouseEnterOice}
        />
      ))}
    </div>
  );
}

LanguageOiceList.propTypes = {
  oices: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  onChangeName: PropTypes.func.isRequired,
  onMouseEnterOice: PropTypes.func.isRequired,
};

export default translate('LanguageSettingTab')(LanguageOiceList);
