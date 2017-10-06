import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import './Caption.styles.scss';

function AboutPageHeader(props) {
  const className = classNames('section-title', {
    gradient: props.isGradient,
  });

  return (
    <header className={className}>
      <h1 dangerouslySetInnerHTML={{ __html: props.t('title') }} />
    </header>
  );
}

AboutPageHeader.propTypes = {
  t: PropTypes.func.isRequired,
  isGradient: PropTypes.bool,
};

export default AboutPageHeader;
