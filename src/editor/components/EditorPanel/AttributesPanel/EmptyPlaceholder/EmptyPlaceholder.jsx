import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import './style.scss';


const EmptyPlaceholder = ({ t }) => (
  <div className="asset-empty-placeholder">
    {t('placeholder.empty')}
  </div>
);

EmptyPlaceholder.propTypes = {
  t: PropTypes.func.isRequired,
};


export default translate('LibraryDetails')(EmptyPlaceholder);
