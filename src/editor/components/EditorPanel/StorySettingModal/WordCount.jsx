import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

function WordCount({ t, count }) {
  const wordCount = !Number.isFinite(count) ? t('wordCount.counting') : (
    t('wordCount.count', { count })
  );
  return (
    <span className="word-count">
      {t('wordCount.title')}:
      <span>{wordCount}</span>
    </span>
  );
}

WordCount.propTypes = {
  t: PropTypes.func.isRequired,
  count: PropTypes.number,
};

export default translate('editor')(WordCount);
