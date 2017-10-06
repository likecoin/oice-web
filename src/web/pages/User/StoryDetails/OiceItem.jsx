import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './style.scss';


const OiceItem = (props) => {
  const { index, oice } = props;
  const cover = oice.cover || '/static/img/oice-default-cover2.jpg';
  let description = oice.description || '';
  if (description.length > 18) {
    description = `${description.substring(0, 18)} ...`;
  }

  function handleClick() {
    window.location.href = `/story/${oice.uuid}`;
  }

  return (
    <div className="oice" onClick={handleClick}>
      <h1>{index}.</h1>
      <div
        className="preview"
        style={{ backgroundImage: `url("${cover}")` }}
      />
      <h2>{oice.name}</h2>
      <p>{description}</p>
    </div>
  );
};

OiceItem.propTypes = {
  oice: PropTypes.object.isRequired,
  index: PropTypes.number,
};

export default OiceItem;
