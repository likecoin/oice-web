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

function isNewlyTranslatedOice(oice) {
  // there is no author for oice with newly translated language
  return !_get(oice, 'author');
}

function OiceListItem(props) {
  const { t, oice, index, onChangeName, onMouseEnterOice, onMouseLeaveOice } = props;

  function handleChangeName(name) {
    if (onChangeName) {
      onChangeName({
        oiceId: oice.id,
        oiceName: name,
      });
    }
  }

  function handleMouseEnterOice() {
    if (onMouseEnterOice && !isNewlyTranslatedOice(oice)) {
      onMouseEnterOice(oice, index);
    }
  }

  function handleMouseLeaveOice() {
    if (onMouseLeaveOice) onMouseLeaveOice();
  }

  return (
    <div
      className="language-oice-item"
      onMouseEnter={handleMouseEnterOice}
      onMouseLeave={handleMouseLeaveOice}
    >
      <div className="left-column">
        {!isNewlyTranslatedOice(oice) && <WordCount count={oice.wordCount} />}
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
  onMouseLeaveOice: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const OiceListItemElement = translate('OiceSettingTab')(OiceListItem);

function LanguageOiceList(props) {
  const { t, oices, onChangeName, onMouseEnterOice, onMouseLeaveOice } = props;
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
          onMouseLeaveOice={onMouseLeaveOice}
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
  onMouseLeaveOice: PropTypes.func.isRequired,
};

export default translate('LanguageSettingTab')(LanguageOiceList);
