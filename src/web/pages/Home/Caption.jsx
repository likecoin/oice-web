import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import './Caption.styles.scss';

function AboutPageCaption(props) {
  const className = classNames('caption', {
    absolute: props.isAbsolute,
  });

  return (
    <div className={className}>
      <h2>{props.title}</h2>
      <p>{props.details}</p>
    </div>
  );
}

AboutPageCaption.propTypes = {
  isAbsolute: PropTypes.bool,
  title: PropTypes.string,
  details: PropTypes.string,
};

export default AboutPageCaption;
