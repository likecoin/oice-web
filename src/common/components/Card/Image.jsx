import React from 'react';
import PropTypes from 'prop-types';

export default class CardImage extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    width: PropTypes.number,
    src: PropTypes.string.isRequired,
  }

  render() {
    const { style, src, width } = this.props;
    return (
      <div
        className="card-image"
        style={{
          ...style,
          width,
          height: width,
          backgroundImage: `url('${src}')`,
        }}
      />
    );
  }
}
