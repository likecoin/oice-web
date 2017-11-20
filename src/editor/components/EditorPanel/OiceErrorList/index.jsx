import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';


function ErrorAttributeList(props) {
  const { blockId, blockIndex, macroName, errors, t } = props;
  return (
    <ul className="error-attribute-list">
      {errors.map(({ attributeName, code, value }) => (
        <li key={attributeName} className="error-attribute-item">
          <table>
            <tr>
              <td><span>{t('oiceError.errorAttribute')}</span></td>
              <td><span>{t(`macro:${macroName}.${attributeName}`)}</span></td>
            </tr>
            <tr>
              <td><span>{t('oiceError.messageLabel')}</span></td>
              <td><span>{t(`oiceError.code.${code}`, { blockIndex, blockId, value })}</span></td>
            </tr>
            {!!value &&
              <tr>
                <td><span>{t('oiceError.value')}</span></td>
                <td><span>{value}</span></td>
              </tr>
            }
          </table>
        </li>
      ))}
    </ul>
  );
}

ErrorAttributeList.propTypes = {
  t: PropTypes.func.isRequired,
  blockId: PropTypes.number.isRequired,
  blockIndex: PropTypes.number.isRequired,
  macroName: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.shape({
    attributeName: PropTypes.string.isRequired,
    code: PropTypes.number.isRequired,
    value: PropTypes.string,
  })),
};

const OiceErrorList = (props) => {
  const { t, errors } = props;

  return (
    <ul>
      {errors.map((error) => {
        const { id, macroName, order } = error.block;
        const blockIndex = order + 1;
        const errorAttributes = error.errors;
        return (
          <li key={id} className="error-block-item">
            <h1>{t('oiceError.errorBlock')} {blockIndex} #{id} - {t(`macro:${macroName}._title`)}</h1>
            <div>
              <ErrorAttributeList
                blockId={id}
                blockIndex={blockIndex}
                macroName={macroName}
                errors={errorAttributes}
                t={t}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

OiceErrorList.propTypes = {
  t: PropTypes.func.isRequired,
  errors: PropTypes.array,
};

export default OiceErrorList;
