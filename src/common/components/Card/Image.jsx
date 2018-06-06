import React from 'react';
import PropTypes from 'prop-types';

export default function CardImage({
  wrapper,
  style,
  src,
  width,
  ...props
}) {
  const Wrapper = wrapper;
  return (
    <Wrapper
      className="card-image"
      {...props}
      style={{
        ...style,
        width,
        height: width,
        backgroundImage: `url('${src}')`,
      }}
    />
  );
}

CardImage.propTypes = {
  style: PropTypes.object,
  width: PropTypes.number,
  src: PropTypes.string.isRequired,
  wrapper: PropTypes.string,
};

CardImage.defaultProps = {
  wrapper: 'div',
};
