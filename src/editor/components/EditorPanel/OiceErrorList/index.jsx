import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

const OiceErrorList = (props) => {
  const { t, errors } = props;

  const renderErrorMessages = (errorsObj) => {
    const errorMessagesComponent = Object.keys(errorsObj).map((key, index) => {
      const errorMessage = errorsObj[key];
      return (
        <li key={index} className="error-attribute-item">
          <div><span >{t('oiceError.attributeName')}</span> {key}</div>
          <div><span>{t('oiceError.messageLabel')}</span> {errorMessage}</div>
        </li>);
    });
    return errorMessagesComponent;
  };

  const render = errors.map((error, i) => {
    console.log(error);
    const errorBlockId = error.blockId;
    const errorsObj = error.errors;
    return (
      <li className="error-block-item" key={i}>
        <span>{t('oiceError.errorBlockId')}</span> #{errorBlockId}
        <ul>
          {renderErrorMessages(errorsObj)}
        </ul>
      </li>
    );
  });
  return <ul>{render}</ul>;
};

OiceErrorList.propTypes = {
  t: PropTypes.func.isRequired,
  errors: PropTypes.array,
};

export default OiceErrorList;
